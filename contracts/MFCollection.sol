//SPDX-License-Identifier: UNLICENCED
pragma solidity >=0.5.0 <0.9.0;

contract MFCollection {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "You are not the owner");
        _;
    }

    struct SellerDetails {
        string sellerName;
        address sellerAddress;
        uint256 sellerId;
        string sellerCountry;
        bool approvedSeller;
    }

    mapping(uint256 => SellerDetails) public sellers;
    mapping(address => uint256) public sellersId;

    struct Item {
        uint256 id;
        string name;
        string title;
        string description;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
        address payable seller;
    }

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public itemsId;

    struct Order {
        uint256 time;
        Item item;
        address buyer;
        uint256 quantity;
        bool productDelivered;
        bool paymentCompleted;
    }

    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event SellerInformation(
        uint256 SellerId,
        address SellerAddress,
        bool Approved
    );
    event ListProduct(
        uint256 ProductId,
        string Name,
        uint256 Cost,
        uint256 Stock,
        address Owner
    );
    event Buy(uint256 ProductId, address Buyer, uint256 OrderCount);
    event Delivered(uint256 ProductId);
    event Withdraw(
        uint256 ProductId,
        uint256 OwnerCommission,
        uint256 SellerAmount,
        address Buyer
    );

    uint256 id = 1;

    // Seller Information
    function sellerInformation(
        string memory _sellerName,
        uint256 _sellerId,
        string memory sellerCountry
    ) public {
        require(msg.sender != owner, "Owner is not seller");
        SellerDetails memory seller = SellerDetails(
            _sellerName,
            msg.sender,
            _sellerId,
            sellerCountry,
            false
        );

        // Store in Blockchains
        sellers[_sellerId] = seller;
        sellersId[msg.sender] = _sellerId;
    }

    function approveSeller(uint256 _sellerId) public onlyOwner {
        require(
            sellers[_sellerId].approvedSeller == false,
            "You are already approved this seller"
        );
        sellers[_sellerId].approvedSeller = true;

        // emit
        emit SellerInformation(
            _sellerId,
            sellers[_sellerId].sellerAddress,
            sellers[_sellerId].approvedSeller
        );
    }

    //Seller Register Product
    function listProduct(
        string memory _name,
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public {
        require(
            owner != msg.sender,
            "You are the owner. You Cannot add the product List"
        );
        require(_cost > 0, "Price greater than Zero");

        require(
            sellers[sellersId[msg.sender]].approvedSeller == true,
            "You are not Approved Seller"
        );
        //Create Item
        Item memory item = Item(
            id,
            _name,
            _title,
            _description,
            _category,
            _image,
            _cost,
            _rating,
            _stock,
            payable(msg.sender)
        );

        //Save items Struct to Blockchain
        items[id] = item;
        itemsId[msg.sender] = id;

        id++;

        //emit
        emit ListProduct(id, _name, _cost, _stock, msg.sender);
    }

    //Buyer buy the Product
    function buyProduct(uint256 _id, uint256 _quantity) public payable {
        // Fetch item
        Item memory item = items[_id];

        // Require enough ether to buy item
        require(
            msg.value == item.cost * _quantity,
            "Please pay the exact Price of Product"
        );

        //Seller cannot buy the Product
        require(
            msg.sender != item.seller,
            "Seller Cannot Buy the own Products"
        );

        // Require item is in stock
        require(item.stock >= _quantity, "Out of Stock");

        //Create an Order
        Order memory order = Order(
            block.timestamp,
            item,
            msg.sender,
            _quantity,
            false,
            false
        );

        //Save order to  Chains
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;

        //Substract Stock
        items[_id].stock = item.stock - _quantity;

        //Buy emit
        emit Buy(item.id, msg.sender, orderCount[msg.sender]);
    }

    //Buyer Recived the Product
    function delivery(uint256 _orderCount) public {
        require(
            orders[msg.sender][_orderCount].buyer == msg.sender,
            "Only Buyer Can Confirm it"
        );
        require(
            orders[msg.sender][_orderCount].productDelivered == false,
            "Product already delivered"
        );

        //update Orders to the Blockchain
        orders[msg.sender][_orderCount].productDelivered = true;

        //Delivery emit
        emit Delivered(items[itemsId[msg.sender]].id);
    }

    //Seller Payment Recieve
    function withdraw(address buyer, uint256 _orderCount) public {
        require(
            orders[buyer][_orderCount].productDelivered == true,
            "Product is not Delivered"
        );
        require(
            orders[buyer][_orderCount].paymentCompleted == false,
            "Payment sent to the seller"
        );
        require(
            items[itemsId[msg.sender]].seller == msg.sender,
            "You are not Seller"
        );

        //Owner Commission
        uint256 commission = (orders[buyer][_orderCount].item.cost *
            orders[buyer][_orderCount].quantity) / 2; //50%

        //Seller Ammount
        uint256 sellerAmount = (orders[buyer][_orderCount].item.cost *
            orders[buyer][_orderCount].quantity) - commission;

        //Transfer Amount to Owner and Seller
        payable(items[itemsId[msg.sender]].seller).transfer(sellerAmount);
        payable(owner).transfer(commission);

        //update Orders to the Blockchain
        orders[buyer][_orderCount].paymentCompleted = true;

        //WithDraw emit
        emit Withdraw(
            orders[buyer][_orderCount].item.id,
            commission,
            sellerAmount,
            buyer
        );
    }
}
