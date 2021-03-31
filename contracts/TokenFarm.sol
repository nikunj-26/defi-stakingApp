pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./PogToken.sol";


contract TokenFarm{
    //Name for contract
    string public name = "Token Farm";
    address public owner;

    //Initialize the DaiToken and PogToken
    DaiToken public daiToken;
    PogToken public pogToken;

    //Mappings
    mapping(address=>uint) public stakingBalance;
    mapping(address=>bool) public hasStaked;
    mapping(address=>bool) public isStaking;

    //Array of people who have staked
    address[] public stakers;

    //Assigning the values using the constructor
    constructor (PogToken _pogToken,DaiToken _daiToken) public {
        daiToken = _daiToken;
        pogToken = _pogToken;
        owner = msg.sender;
    }

    //Stake Tokens (Deposit)
    function stakeTokens(uint _amount) public {
        //Require amount greater than 0
        require(_amount>0,"Amount cannot be 0 for staking");

        //Transfer mDai Tokens to this contract for staking
        daiToken.transferFrom(msg.sender,address(this),_amount);

        //Update Staking Balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        //Add user to stakers array only if they haven't staked already
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        //Update Staking Status
        hasStaked[msg.sender]=true;
        isStaking[msg.sender]=true;
    }

    //Unstake Tokens
    function unstakeTokens() public {
        //Fetch balance
        uint balance = stakingBalance[msg.sender];

        //Require amount greater than 0
        require(balance>0,"Balance must be greater than 0");

        //Transfer mDai tokens back to the user
        daiToken.transfer(msg.sender,balance);

        //Update staking status
        isStaking[msg.sender]=false;
        
        //Reset the staking balance
        stakingBalance[msg.sender]=0;
    }



    //Issue Tokens
    function issueTokens() public {
        //Only owner can call this function
        require(msg.sender==owner,"Caller must be owner");

        //Issue Tokens to all stakers
        for(uint i = 0;i<stakers.length;i++){
            address recepient = stakers[i];
            uint balance = stakingBalance[recepient];
            if(balance > 0){
                pogToken.transfer(recepient,balance);
            }
            
        }
    }


}

//1 stake tokens (Deposit)
//2 unstake tokens (Withdraw)
//3 issue tokens (Minter)