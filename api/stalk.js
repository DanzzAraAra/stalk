import axios from "axios";
import * as cheerio from "cheerio";
import needle from "needle";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

// 1. TikTok
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

// 2. GitHub
async function githubStalk(user) {
  try {
    const { data } = await axios.get("https://api.github.com/users/" + user);
    return {
      username: data.login,
      nickname: data.name || data.login, // Fallback
      bio: data.bio || "No bio",
      profile_pic: data.avatar_url,
      url: data.html_url,
      location: data.location || "Unknown",
      stats: {
        followers: data.followers || 0,
        following: data.following || 0,
        repos: data.public_repos || 0
      }
    };
  } catch (error) {
    throw new Error("User not found");
  }
}

// 3. Instagram
async function instagramStalk(username) {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar, withCredentials: true }));
    
    // Cookie perlu diganti berkala jika expired
    const igCookie = "csrftoken=osAtGItPXdetQOXtk2IlfZ; datr=ygJMaBFtokCgDHvSHpjRBiXR; ig_did=4AFB2614-B27A-463C-88D7-634A167A23D1; wd=1920x1080; mid=aEwCygALAAHnO0uXycs4-HkvZeZG;"; 

    try {
        const response = await client.get(
            `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
            {
                headers: {
                    authority: "www.instagram.com",
                    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
                    "x-ig-app-id": "936619743392459",
                    cookie: igCookie
                }
            }
        );
        
        // Safety check untuk response structure
        if(!response.data || !response.data.data || !response.data.data.user) {
            throw new Error("User structure not found");
        }

        const user = response.data.data.user;
        return {
            username: user.username,
            nickname: user.full_name || user.username,
            bio: user.biography || "",
            profile_pic: user.profile_pic_url,
            is_verified: user.is_verified,
            stats: {
                followers: user.edge_followed_by?.count || 0,
                following: user.edge_follow?.count || 0,
                posts: user.edge_owner_to_timeline_media?.count || 0
            }
        };
    } catch (error) {
        throw new Error("Instagram Profile not found or Cookie Invalid");
    }
}

// 4. Pinterest
async function pinterestStalk(username) {
    try {
        const { data } = await axios.get("https://www.pinterest.com/resource/UserResource/get/", {
            params: {
                source_url: `/${username}/`,
                data: JSON.stringify({
                    options: { username, field_set_key: "profile", isPrefetch: false },
                    context: {},
                }),
                _: Date.now(),
            },
            headers: { "User-Agent": "Postify/1.0.0" }
        });

        if (!data.resource_response?.data) throw new Error("User not found");
        const user = data.resource_response.data;
        
        return {
            username: user.username,
            nickname: user.full_name || user.username,
            bio: user.about || "",
            profile_pic: user.image_xlarge_url,
            is_verified: user.verified_identity,
            stats: {
                followers: user.follower_count || 0,
                following: user.following_count || 0,
                pins: user.pin_count || 0
            }
        };
    } catch (error) {
        throw new Error("User not found");
    }
}

// 5. Twitter (X)
async function twitterStalk(username) {
    try {
        const response = await axios.get(
            `https://x.com/i/api/graphql/32pL5BWe9WKeSK1MoPvFQQ/UserByScreenName?variables=%7B%22screen_name%22%3A%22${username}%22%7D&features=%7B%22hidden_profile_subscriptions_enabled%22%3Atrue%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22subscriptions_verification_info_is_identity_verified_enabled%22%3Atrue%2C%22subscriptions_verification_info_verified_since_enabled%22%3Atrue%2C%22highlights_tweets_tab_ui_enabled%22%3Atrue%2C%22responsive_web_twitter_article_notes_tab_enabled%22%3Atrue%2C%22subscriptions_feature_can_gift_premium%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%7D`,
            {
                headers: {
                    authorization: "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
                    cookie: 'guest_id=v1%3A173113403636768133;',
                    "x-csrf-token": "a0b42c9fa97da6bf8505d9fd66cbe549c3b4a33d028d877fb0ae9a1d1b61d814fa831a4f097249ee4dea9a41f5050d12bda9806ce1816e5522572b2f0a81a3bc4f9a9bd2f2fdf4edef38a7759d03648f"
                }
            }
        );
        
        if (!response.data?.data?.user?.result) throw new Error("Twitter user not found");
        
        const userData = response.data.data.user.result;
        const legacy = userData.legacy;
        
        return {
            username: legacy.screen_name,
            nickname: legacy.name || legacy.screen_name,
            bio: legacy.description || "",
            profile_pic: legacy.profile_image_url_https ? legacy.profile_image_url_https.replace("_normal", "_400x400") : "",
            is_verified: userData.is_blue_verified,
            stats: {
                followers: legacy.followers_count || 0,
                following: legacy.friends_count || 0,
                tweets: legacy.statuses_count || 0
            }
        };
    } catch (error) {
        throw new Error("Twitter user not found");
    }
}

// 6. YouTube
async function youtubeStalk(username) {
    try {
        const response = await needle('get', `https://youtube.com/@${username}`, { follow_max: 5 });
        const $ = cheerio.load(response.body);
        const script = $('script').filter((i, el) => $(el).html().includes('var ytInitialData =')).html();
        if(!script) throw new Error("Script not found");

        const json = JSON.parse(script.match(/var ytInitialData = (.*?);/)[1]);
        
        const header = json.header?.pageHeaderRenderer?.content?.pageHeaderViewModel;
        const metadata = header?.metadata?.contentMetadataViewModel?.metadataRows;
        
        let subCount = "0";
        let vidCount = "0";

        if (metadata) {
            metadata.forEach(row => {
               row.metadataParts.forEach(part => {
                   if(part.text?.content?.includes('subscribers')) subCount = part.text.content;
                   if(part.text?.content?.includes('videos')) vidCount = part.text.content;
               });
            });
        }

        return {
            username: header?.title?.content || username,
            nickname: header?.title?.content || username,
            bio: header?.metadata?.contentMetadataViewModel?.metadataRows[0]?.metadataParts[0]?.text?.content || "Youtube Channel",
            profile_pic: header?.image?.decoratedAvatarViewModel?.avatar?.avatarViewModel?.image?.sources[0]?.url || "",
            is_verified: true, // simplified
            stats: {
                subscribers: subCount,
                videos: vidCount,
                views: "N/A"
            }
        };
    } catch (error) {
        throw new Error("Channel not found");
    }
}


// --- MAIN HANDLER ---

export default async function handler(req, res) {
  const { username, type = "tiktok" } = req.query;

  if (!username) {
    return res.status(400).json({ status: false, error: "Username is required" });
  }

  const cleanUser = username.replace('@', '').trim();
  let result;

  try {
    switch (type.toLowerCase()) {
        case 'tiktok': result = await tiktokStalk(cleanUser); break;
        case 'github': result = await githubStalk(cleanUser); break;
        case 'instagram': result = await instagramStalk(cleanUser); break;
        case 'pinterest': result = await pinterestStalk(cleanUser); break;
        case 'twitter': result = await twitterStalk(cleanUser); break;
        case 'youtube': result = await youtubeStalk(cleanUser); break;
        default: throw new Error("Platform not supported");
    }

    return res.status(200).json({
      status: true,
      platform: type,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
}
