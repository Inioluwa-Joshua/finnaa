import { v2 as cloudinary } from "cloudinary";
import uniqid from "uniqid";
import axios from "axios";

// Function to check Cloudinary quota
async function checkCloudinaryQuota(cloudName, apiKey, apiSecret) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/usage`;
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    const { usage, limit } = response.data.credits;
    // Assuming we are checking for storage usage, modify this as needed
    return usage / limit < 0.9; // 90% threshold
  } catch (error) {
    console.error("Error checking Cloudinary quota:", error);
    return false;
  }
}

// Function to configure Cloudinary based on available quota
async function getAvailableCloudinaryConfig() {
  const account1 = {
    cloudName: process.env.CLOUDINARY_ACCOUNT_1_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_ACCOUNT_1_API_KEY,
    apiSecret: process.env.CLOUDINARY_ACCOUNT_1_API_SECRET,
  };

  const account2 = {
    cloudName: process.env.CLOUDINARY_ACCOUNT_2_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_ACCOUNT_2_API_KEY,
    apiSecret: process.env.CLOUDINARY_ACCOUNT_2_API_SECRET,
  };

  if (
    await checkCloudinaryQuota(
      account1.cloudName,
      account1.apiKey,
      account1.apiSecret
    )
  ) {
    return account1;
  } else if (
    await checkCloudinaryQuota(
      account2.cloudName,
      account2.apiKey,
      account2.apiSecret
    )
  ) {
    return account2;
  } else {
    throw new Error("All Cloudinary accounts are full.");
  }
}

// Function to configure Cloudinary based on the link's domain
function configureCloudinaryByLink(url) {
  const account1Domain = `res.cloudinary.com/${process.env.CLOUDINARY_ACCOUNT_1_CLOUD_NAME}`;
  const account2Domain = `res.cloudinary.com/${process.env.CLOUDINARY_ACCOUNT_2_CLOUD_NAME}`;

  if (url.includes(account1Domain)) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_ACCOUNT_1_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_ACCOUNT_1_API_KEY,
      api_secret: process.env.CLOUDINARY_ACCOUNT_1_API_SECRET,
    });
  } else if (url.includes(account2Domain)) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_ACCOUNT_2_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_ACCOUNT_2_API_KEY,
      api_secret: process.env.CLOUDINARY_ACCOUNT_2_API_SECRET,
    });
  } else {
    throw new Error("Unknown Cloudinary account for URL: " + url);
  }
}

// Function to delete a file from Cloudinary
async function deleteFromCloudinary(url) {
  const publicId = url.split("/").slice(-1)[0].split(".")[0];
  console.log(url);

  configureCloudinaryByLink(url);

  try {
    const deleteCheck = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    // console.log(deleteCheck);
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
  }
}

export async function POST(req) {
  const formData = await req.formData();
  const prevLinks = formData.getAll("prevLink");

  const files = formData.getAll("file");
  if (files.length === 0) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  try {
    const cloudinaryConfig = await getAvailableCloudinaryConfig();

    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });

    const uploadPromises = files.map(async (file) => {
      const randomId = uniqid();
      const ext = file.name.split(".").pop();
      const newFilename = randomId;

      const chunks = [];
      for await (const chunk of file.stream()) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { public_id: newFilename, resource_type: "auto" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });

      return result.secure_url;
    });

    const links = await Promise.all(uploadPromises);

    // Delete the previous files if prevLinks exist
    if (prevLinks.length > 0) {
      const deletePromises = prevLinks.map((url) => deleteFromCloudinary(url));
      await Promise.all(deletePromises);
    }

    return new Response(JSON.stringify({ links }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return new Response(JSON.stringify({ error: "Failed to upload files" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
