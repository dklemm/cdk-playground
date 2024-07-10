import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({ });

const url = "https://timeapi.io/api/Time/current/zone?timeZone=Europe/London";

export const handler = async(event) => {
    try {
        const response = await fetch(url);

        var responseBody = await response.json()

        await client.send(new PutObjectCommand({
            Bucket : process.env.TARGET_BUCKET,
            Key : Date.now().toString() + ".json",
            Body : JSON.stringify({
                london_datetime : responseBody.dateTime
            })
        }));
        
        return 200;
    }
    catch (e) {
        console.error(e);
        return 500;
    }
};
