// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DonationBox {
    uint public campaignCount;

    struct Campaign {
        address owner;
        uint goal;
        uint startTime;
        uint endTime;
        uint totalDonated;
        mapping(address => uint) donations;
        bool withdrawn;
    }

    mapping(uint => Campaign) private campaigns;

    event CampaignCreated(
        uint indexed campaignId,
        address indexed owner,
        uint goal,
        uint startTime,
        uint endTime
    );
    event DonationReceived(
        uint indexed campaignId,
        address indexed donor,
        uint amount
    );
    event GoalReached(uint indexed campaignId, uint total);
    event FundsWithdrawn(
        uint indexed campaignId,
        address indexed owner,
        uint amount
    );

    modifier onlyCampaignOwner(uint _campaignId) {
        require(
            msg.sender == campaigns[_campaignId].owner,
            "Owner yapabilir!"
        );
        _;
    }

    modifier isActive(uint _campaignId) {
        Campaign storage c = campaigns[_campaignId];
        require(
            block.timestamp >= c.startTime && block.timestamp <= c.endTime,
            "Kampanya aktif degil"
        );
        _;
    }

    function createCampaign(
        uint _goal,
        uint _durationInSeconds
    ) external returns (uint) {
        require(_goal > 0, "Hedef 0'dan buyuk olmalidir");
        require(_durationInSeconds > 0, "Sure 0'dan buyuk olmalidir");

        campaignCount++;
        uint campaignId = campaignCount;

        Campaign storage c = campaigns[campaignId];
        c.owner = msg.sender;
        c.goal = _goal;
        c.startTime = block.timestamp;
        c.endTime = block.timestamp + _durationInSeconds;

        emit CampaignCreated(
            campaignId,
            msg.sender,
            _goal,
            c.startTime,
            c.endTime
        );
        return campaignId;
    }

    function donate(uint _campaignId) external payable isActive(_campaignId) {
        require(msg.value > 0, "Bagis 0'dan buyuk olmalidir");

        Campaign storage c = campaigns[_campaignId];
        c.donations[msg.sender] += msg.value;
        c.totalDonated += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);

        if (c.totalDonated >= c.goal) {
            emit GoalReached(_campaignId, c.totalDonated);
        }
    }

    function withdraw(
        uint _campaignId
    ) external onlyCampaignOwner(_campaignId) {
        Campaign storage c = campaigns[_campaignId];
        require(c.totalDonated >= c.goal, "Hedefe ulasilmadi");
        require(!c.withdrawn, "Zaten cekildi");

        uint amount = c.totalDonated;
        c.withdrawn = true;
        payable(c.owner).transfer(amount);

        emit FundsWithdrawn(_campaignId, c.owner, amount);
    }

    function getCampaign(
        uint _campaignId
    )
        external
        view
        returns (
            address owner,
            uint goal,
            uint startTime,
            uint endTime,
            uint totalDonated,
            bool goalReached,
            bool active,
            bool withdrawn
        )
    {
        Campaign storage c = campaigns[_campaignId];
        owner = c.owner;
        goal = c.goal;
        startTime = c.startTime;
        endTime = c.endTime;
        totalDonated = c.totalDonated;
        goalReached = c.totalDonated >= c.goal;
        active = block.timestamp >= c.startTime && block.timestamp <= c.endTime;
        withdrawn = c.withdrawn;
    }

    function getMyDonation(uint _campaignId) external view returns (uint) {
        return campaigns[_campaignId].donations[msg.sender];
    }
}
