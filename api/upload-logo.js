export default async function handler(
    req,
    res
) {

    return res.status(200).json({
        success: true,
        jwt:
            !!process.env.PINATA_JWT
    });

}
