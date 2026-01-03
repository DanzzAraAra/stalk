import axios from "axios";
import * as cheerio from "cheerio";

async function tiktokStalk(user) {
  try {
    const url = `https://tiktok.com/@${user}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "PostmanRuntime/7.32.2",
        "Accept-Encoding": "gzip, deflate, br",
      },
      timeout: 10000,
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    const data = $("#__UNIVERSAL_DATA_FOR_REHYDRATION__").text();
    
    if (data) {
        const result = JSON.parse(data);
        if (result["__DEFAULT_SCOPE__"]["webapp.user-detail"].statusCode !== 0) {
            throw new Error("User not found!");
        }
        return result["__DEFAULT_SCOPE__"]["webapp.user-detail"]["userInfo"];
    } else {
        const scriptData = $('script#SIGI_STATE').text();
        if(scriptData) {
            const json = JSON.parse(scriptData);
            if(!json.UserModule) throw new Error("User not found");
            const userInfo = json.UserModule.users[user];
            const stats = json.UserModule.stats[user];
            return { ...userInfo, stats };
        }
        throw new Error("Data not found");
    }
  } catch (err) {
    throw new Error(err.message || err);
  }
}

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      status: false,
      error: "Username parameter is required",
      code: 400,
    });
  }

  try {
    const cleanUsername = username.replace('@', '').trim();
    const result = await tiktokStalk(cleanUsername);
    return res.status(200).json({
      status: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      code: 500,
    });
  }
}