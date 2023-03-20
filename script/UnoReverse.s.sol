// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import {L2ArbitrumToken} from "../src/contracts/L2ArbitrumToken.sol";
import {TokenDistributor} from "../src/contracts/TokenDistributor.sol";

contract MoveETH {
    constructor(address sendToAddress) payable {
        address payable addr = payable(address(sendToAddress));
        selfdestruct(addr);
    }
}

contract FuckBots is Script {
    address payable compromised =
        payable(vm.addr(vm.envUint("PK_COMPROMISED")));
    address payable fresh = payable(vm.addr(vm.envUint("PK_FRESH")));
    address attacker = 0xe2210f70d229904436DF2A8071f0bd72F643A1Cc;

    L2ArbitrumToken ARB =
        L2ArbitrumToken(0x912CE59144191C1204E64559FE8253a0e49E6548);
    TokenDistributor distributor =
        TokenDistributor(0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9);

    // how much eth to send
    uint256 ethTxValue = 0.1 ether;

    function setUp() public {}

    function run() public {
        // deploy a contract that will send all the ETH to the compromised address
        vm.startBroadcast(fresh);

        new MoveETH{value: ethTxValue}(compromised);

        vm.stopBroadcast();

        vm.startBroadcast(compromised);

        // remove the allowance for the attacker
        uint256 allowance = ARB.allowance(compromised, attacker);
        ARB.decreaseAllowance(attacker, allowance);

        vm.stopBroadcast();
    }
}
