export const config = {
    api: {
        bodyParser: false
    }
};

export default async function handler(
    req,
    res
) {

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });

    }

    try {

        const jwt =
            process.env.PINATA_JWT;

        const pinataRes =
            await fetch(
                "https://api.pinata.cloud/data/testAuthentication",
                {
                    headers: {
                        Authorization:
                            `Bearer ${jwt}`
                    }
                }
            );

        const result =
            await pinataRes.json();

        return res.status(200).json({
            success: true,
            pinata: result
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

}
