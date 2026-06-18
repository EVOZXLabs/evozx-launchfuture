import {
    Contract,
    JsonRpcProvider,
    Interface
} from "https://esm.sh/ethers@6";

import {
    CONTRACTS,
    NETWORK,
    ABI
} from "./config.js";

import {
    getSigner
} from "./wallet.js";

// =====================================================
// STATE
// =====================================================

let factoryAbi = null;

let evozxAbi = null;

let factoryInterface = null;

let provider = null;

let factoryRead = null;

let factoryWrite = null;

let evozxRead = null;

let evozxWrite = null;

// =====================================================
// ABI
// =====================================================

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
            ABI.factory
        );

    factoryInterface =
        new Interface(
            factoryAbi
        );

    return factoryAbi;

}

export async function loadEVOZXAbi() {

    if (evozxAbi) {

        return evozxAbi;

    }

    evozxAbi =
        await loadAbi(
            ABI.evozx
        );

    return evozxAbi;

}

// =====================================================
// PROVIDER
// =====================================================

export function getReadProvider() {

    if (provider) {

        return provider;

    }

    provider =
        new JsonRpcProvider(
            NETWORK.rpcUrl
        );

    return provider;

}

// =====================================================
// CONTRACTS
// =====================================================

export async function getFactoryRead() {

    if (factoryRead) {

        return factoryRead;

    }

    factoryRead =
        new Contract(

            CONTRACTS.factory,

            await loadFactoryAbi(),

            getReadProvider()

        );

    return factoryRead;

}

export async function getFactoryWrite() {

    const signer =
        getSigner();

    if (!signer) {

        throw new Error(
            "Wallet not connected."
        );

    }

    factoryWrite =
        new Contract(

            CONTRACTS.factory,

            await loadFactoryAbi(),

            signer

        );

    return factoryWrite;

}

export async function getEVOZXRead() {

    if (evozxRead) {

        return evozxRead;

    }

    evozxRead =
        new Contract(

            CONTRACTS.evozx,

            await loadEVOZXAbi(),

            getReadProvider()

        );

    return evozxRead;

}

export async function getEVOZXWrite() {

    const signer =
        getSigner();

    if (!signer) {

        throw new Error(
            "Wallet not connected."
        );

    }

    evozxWrite =
        new Contract(

            CONTRACTS.evozx,

            await loadEVOZXAbi(),

            signer

        );

    return evozxWrite;

}

export const getFactoryForWrite =
    getFactoryWrite;

// =====================================================
// EVENT PARSER
// =====================================================

async function parseTokenCreated(
    receipt
) {

    await loadFactoryAbi();

    for (const log of receipt.logs) {

        try {

            const parsed =
                factoryInterface.parseLog(
                    log
                );

            if (
                parsed?.name ===
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

            continue;

        }

    }

    return null;

}

// =====================================================
// FACTORY INFO
// =====================================================

export async function getFactoryName() {

    return (
        await getFactoryRead()
    ).FACTORY_NAME();

}

export async function getVersion() {

    return (
        await getFactoryRead()
    ).VERSION();

}

export async function getLaunchKitVersion() {

    return (
        await getFactoryRead()
    ).LAUNCHKIT_VERSION();

}

export async function getOwner() {

    return (
        await getFactoryRead()
    ).owner();

}

export async function getTreasury() {

    return (
        await getFactoryRead()
    ).treasury();

}

export async function getFeeMultiplier() {

    return (
        await getFactoryRead()
    ).feeMultiplier();

}

// =====================================================
// TOKEN REGISTRY
// =====================================================

export async function getTotalTokens() {

    return Number(

        await (

            await getFactoryRead()

        ).totalTokens()

    );

}

export async function getAllTokens() {

    return (

        await getFactoryRead()

    ).getAllTokens();

}

export async function getToken(index) {

    return (

        await getFactoryRead()

    ).getToken(index);

}

export async function getTokensByCreator(
    creator
) {

    if (!creator) {

        return [];

    }

    return (

        await getFactoryRead()

    ).getTokensByCreator(

        creator

    );

}

export async function isFactoryToken(
    address
) {

    if (!address) {

        return false;

    }

    return (

        await getFactoryRead()

    ).isTokenFromFactory(

        address

    );

}

// =====================================================
// SYMBOL
// =====================================================

export async function symbolExists(
    symbol
) {

    if (!symbol) {

        return false;

    }

    return (

        await getFactoryRead()

    ).symbolExists(

        symbol

            .trim()

            .toUpperCase()

    );

}

// =====================================================
// DEPLOYMENT FEE
// =====================================================

export async function getDeploymentFee(
    config
) {

    return (

        await getFactoryRead()

    ).getDeploymentFee(

        config

    );

}

// =====================================================
// EVOZX BALANCE
// =====================================================

export async function getEVOZXBalance(
    address
) {

    if (!address) {

        return 0n;

    }

    return (

        await getEVOZXRead()

    ).balanceOf(

        address

    );

}

// =====================================================
// EVOZX ALLOWANCE
// =====================================================

export async function getEVOZXAllowance(
    owner
) {

    if (!owner) {

        return 0n;

    }

    return (

        await getEVOZXRead()

    ).allowance(

        owner,

        CONTRACTS.factory

    );

}

// =====================================================
// APPROVAL
// =====================================================

export async function approveEVOZX(
    amount
) {

    if (

        !amount ||

        amount <= 0n

    ) {

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

export async function createToken(
    config
) {

    const factory =

        await getFactoryWrite();

    const tx =

        await factory.createToken(

            config

        );

    const receipt =

        await tx.wait();

    const event =

        await parseTokenCreated(

            receipt

        );

    if (!event) {

        throw new Error(

            "TokenCreated event not found."

        );

    }

    return {

        hash:

            tx.hash,

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
    amount
) {

    const allowance =

        await getEVOZXAllowance(

            owner

        );

    if (

        allowance >= amount

    ) {

        return false;

    }

    await approveEVOZX(

        amount

    );

    return true;

}

// =====================================================
// BALANCE CHECK
// =====================================================

export async function hasEnoughEVOZX(
    owner,
    amount
) {

    const balance =

        await getEVOZXBalance(

            owner

        );

    return (

        balance >= amount

    );

}

// =====================================================
// DEPLOYMENT PREVIEW
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
// HELPERS
// =====================================================

export function toBigInt(
    value
) {

    try {

        return BigInt(value);

    }

    catch {

        return 0n;

    }

}

export function isZeroAddress(
    address
) {

    return (

        !address ||

        address ===

        "0x0000000000000000000000000000000000000000"

    );

}

// =====================================================
// FACTORY SUMMARY
// =====================================================

export async function getFactoryInfo() {

    const [

        name,
        version,
        launchKitVersion,
        owner,
        treasury,
        feeMultiplier,
        totalTokens

    ] = await Promise.all([

        getFactoryName(),
        getVersion(),
        getLaunchKitVersion(),
        getOwner(),
        getTreasury(),
        getFeeMultiplier(),
        getTotalTokens()

    ]);

    return {

        name,
        version,
        launchKitVersion,
        owner,
        treasury,
        feeMultiplier,
        totalTokens

    };

}
