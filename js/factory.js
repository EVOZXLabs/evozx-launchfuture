import {
    BrowserProvider,
    Contract,
    JsonRpcProvider
} from "https://esm.sh/ethers@6";

import {
    CONTRACTS,
    NETWORK
} from "./config.js";

import {
    getSigner
} from "./wallet.js";

let factoryAbi = null;
let evozxAbi = null;

let readProvider = null;

let factoryRead = null;
let factoryWrite = null;

let evozxRead = null;
let evozxWrite = null;

async function loadAbi(path) {

    const response =
        await fetch(path);

    if (!response.ok) {

        throw new Error(
            `Unable to load ABI: ${path}`
        );

    }

    return await response.json();

}

export async function loadFactoryAbi() {

    if (factoryAbi) {

        return factoryAbi;

    }

    factoryAbi =
        await loadAbi(
            "./abi/factory.json"
        );

    return factoryAbi;

}

export async function loadEVOZXAbi() {

    if (evozxAbi) {

        return evozxAbi;

    }

    evozxAbi =
        await loadAbi(
            "./abi/evozx.json"
        );

    return evozxAbi;

}

export function getReadProvider() {

    if (readProvider) {

        return readProvider;

    }

    readProvider =
        new JsonRpcProvider(
            NETWORK.rpc
        );

    return readProvider;

}

export async function getFactoryRead() {

    if (factoryRead) {

        return factoryRead;

    }

    const abi =
        await loadFactoryAbi();

    factoryRead =
        new Contract(

            CONTRACTS.factory,

            abi,

            getReadProvider()

        );

    return factoryRead;

}

export async function getEVOZXRead() {

    if (evozxRead) {

        return evozxRead;

    }

    const abi =
        await loadEVOZXAbi();

    evozxRead =
        new Contract(

            CONTRACTS.evozx,

            abi,

            getReadProvider()

        );

    return evozxRead;

}

export async function getFactoryWrite() {

    const signer =
        getSigner();

    if (!signer) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const abi =
        await loadFactoryAbi();

    factoryWrite =
        new Contract(

            CONTRACTS.factory,

            abi,

            signer

        );

    return factoryWrite;

}

export async function getFactoryForWrite() {

    return await getFactoryWrite();

}

export async function getEVOZXWrite() {

    const signer =
        getSigner();

    if (!signer) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const abi =
        await loadEVOZXAbi();

    evozxWrite =
        new Contract(

            CONTRACTS.evozx,

            abi,

            signer

        );

    return evozxWrite;

}

function parseTokenCreated(receipt) {

    if (!receipt) {

        return null;

    }

    for (const log of receipt.logs) {

        try {

            const parsed =
                factoryWrite.interface.parseLog(
                    log
                );

            if (

                parsed &&
                parsed.name ===
                "TokenCreated"

            ) {

                return {

                    token:
                        parsed.args.token,

                    creator:
                        parsed.args.creator,

                    name:
                        parsed.args.name,

                    symbol:
                        parsed.args.symbol,

                    supply:
                        parsed.args.supply,

                    chainId:
                        parsed.args.chainId

                };

            }

        }

        catch {

        }

    }

    return null;

                }

// =====================================================
// FACTORY INFO
// =====================================================

export async function getFactoryName() {

    const factory =
        await getFactoryRead();

    return await factory.FACTORY_NAME();

}

export async function getVersion() {

    const factory =
        await getFactoryRead();

    return await factory.VERSION();

}

export async function getTreasury() {

    const factory =
        await getFactoryRead();

    return await factory.treasury();

}

// =====================================================
// TOKEN DATA
// =====================================================

export async function getTotalTokens() {

    const factory =
        await getFactoryRead();

    const total =
        await factory.totalTokens();

    return Number(total);

}

export async function getAllTokens() {

    const factory =
        await getFactoryRead();

    return await factory.getAllTokens();

}

// =====================================================
// SYMBOL VALIDATION
// =====================================================

export async function symbolExists(symbol) {

    if (!symbol) {

        return false;

    }

    const factory =
        await getFactoryRead();

    return await factory.symbolExists(
        symbol.trim().toUpperCase()
    );

}

// =====================================================
// DEPLOYMENT FEE
// =====================================================

export async function getDeploymentFee(config) {

    const factory =
        await getFactoryRead();

    return await factory.getDeploymentFee(
        config
    );

}

// =====================================================
// EVOZX BALANCE
// =====================================================

export async function getEVOZXBalance(address) {

    if (!address) {

        return 0n;

    }

    const token =
        await getEVOZXRead();

    return await token.balanceOf(
        address
    );

}

// =====================================================
// EVOZX ALLOWANCE
// =====================================================

export async function getEVOZXAllowance(address) {

    if (!address) {

        return 0n;

    }

    const token =
        await getEVOZXRead();

    return await token.allowance(

        address,

        CONTRACTS.factory

    );

}

// =====================================================
// FACTORY CONSTANTS
// =====================================================

export async function getFeeMultiplier() {

    const factory =
        await getFactoryRead();

    return await factory.feeMultiplier();

}

export async function getLaunchKitVersion() {

    const factory =
        await getFactoryRead();

    return await factory.LAUNCHKIT_VERSION();

}

export async function getOwner() {

    const factory =
        await getFactoryRead();

    return await factory.owner();

}

// =====================================================
// TOKEN LOOKUP
// =====================================================

export async function getToken(index) {

    const factory =
        await getFactoryRead();

    return await factory.getToken(
        index
    );

}

export async function getTokensByCreator(address) {

    if (!address) {

        return [];

    }

    const factory =
        await getFactoryRead();

    return await factory.getTokensByCreator(
        address
    );

}

export async function isFactoryToken(address) {

    if (!address) {

        return false;

    }

    const factory =
        await getFactoryRead();

    return await factory.isTokenFromFactory(
        address
    );

            }

// =====================================================
// APPROVE EVOZX
// =====================================================

export async function approveEVOZX(amount) {

    if (!amount || amount <= 0n) {

        throw new Error(
            "Invalid approval amount."
        );

    }

    const token =
        await getEVOZXWrite();

    const tx =
        await token.approve(

            CONTRACTS.factory,

            amount

        );

    await tx.wait();

    return tx;

}

// =====================================================
// CREATE TOKEN
// =====================================================

export async function createToken(config) {

    const factory =
        await getFactoryWrite();

    const tx =
        await factory.createToken(
            config
        );

    const receipt =
        await tx.wait();

    const event =
        parseTokenCreated(
            receipt
        );

    if (!event) {

        throw new Error(
            "TokenCreated event not found."
        );

    }

    return {

        hash:
            receipt.hash,

        blockNumber:
            receipt.blockNumber,

        token:
            event.token,

        creator:
            event.creator,

        name:
            event.name,

        symbol:
            event.symbol,

        supply:
            event.supply,

        chainId:
            event.chainId

    };

}

// =====================================================
// APPROVAL CHECK
// =====================================================

export async function ensureApproval(
    owner,
    requiredAmount
) {

    const allowance =
        await getEVOZXAllowance(
            owner
        );

    if (
        allowance >= requiredAmount
    ) {

        return false;

    }

    await approveEVOZX(
        requiredAmount
    );

    return true;

}

// =====================================================
// BALANCE CHECK
// =====================================================

export async function hasEnoughEVOZX(
    owner,
    requiredAmount
) {

    const balance =
        await getEVOZXBalance(
            owner
        );

    return balance >= requiredAmount;

}

// =====================================================
// TOKEN INFO HELPER
// =====================================================

export async function getDeploymentPreview(
    config,
    owner
) {

    const fee =
        await getDeploymentFee(
            config
        );

    const balance =
        await getEVOZXBalance(
            owner
        );

    const allowance =
        await getEVOZXAllowance(
            owner
        );

    return {

        fee,

        balance,

        allowance,

        enoughBalance:
            balance >= fee,

        approved:
            allowance >= fee

    };

}

// =====================================================
// FORMAT HELPERS
// =====================================================

export function toBigInt(value) {

    return BigInt(value);

}

export function isZeroAddress(address) {

    return (

        !address ||

        address ===
        "0x0000000000000000000000000000000000000000"

    );

}
