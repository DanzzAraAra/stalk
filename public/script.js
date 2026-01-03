const stalkBtn = document.getElementById('stalkBtn');
const usernameInput = document.getElementById('usernameInput');
const loaderArea = document.getElementById('loaderArea');
const emptyState = document.getElementById('emptyState');
const resultArea = document.getElementById('resultArea');
let currentPlatform = 'tiktok';

const platformConfig = {
    tiktok: {
        color: 'from-pink-500 to-cyan-500',
        stats: ['Followers', 'Following', 'Likes'],
        tips: 'Profile Pic HD, Follower Stats, Bio',
        map: (d) => ({
            avatar: d.avatarLarger || d.avatarMedium,
            name: d.nickname,
            username: d.uniqueId,
            bio: d.signature,
            link: `https://tiktok.com/@${d.uniqueId}`,
            verified: d.verified,
            s1: d.stats.followerCount,
            s2: d.stats.followingCount,
            s3: d.stats.heartCount
        })
    },
    github: {
        color: 'from-gray-600 to-gray-900',
        stats: ['Followers', 'Following', 'Repos'],
        tips: 'Public Repos, Bio, Company',
        map: (d) => ({
            avatar: d.profile_pic,
            name: d.nickname || d.username,
            username: d.username,
            bio: d.bio,
            link: d.url,
            verified: false,
            s1: d.stats.followers,
            s2: d.stats.following,
            s3: d.stats.repos
        })
    },
    instagram: {
        color: 'from-purple-500 to-orange-500',
        stats: ['Followers', 'Following', 'Posts'],
        tips: 'Posts Count, Bio, Verified Status',
        map: (d) => ({
            avatar: d.profile_pic,
            name: d.nickname,
            username: d.username,
            bio: d.bio,
            link: `https://instagram.com/${d.username}`,
            verified: d.is_verified,
            s1: d.stats.followers,
            s2: d.stats.following,
            s3: d.stats.posts
        })
    },
    twitter: {
        color: 'from-blue-400 to-blue-600',
        stats: ['Followers', 'Following', 'Tweets'],
        tips: 'Tweets Count, Verified Status, Bio',
        map: (d) => ({
            avatar: d.profile_pic,
            name: d.nickname,
            username: d.username,
            bio: d.bio,
            link: `https://x.com/${d.username}`,
            verified: d.is_verified,
            s1: d.stats.followers,
            s2: d.stats.following,
            s3: d.stats.tweets
        })
    },
    pinterest: {
        color: 'from-red-500 to-red-700',
        stats: ['Followers', 'Following', 'Pins'],
        tips: 'Saved Pins, Boards, Bio',
        map: (d) => ({
            avatar: d.profile_pic,
            name: d.nickname,
            username: d.username,
            bio: d.bio,
            link: `https://pinterest.com/${d.username}`,
            verified: d.is_verified,
            s1: d.stats.followers,
            s2: d.stats.following,
            s3: d.stats.pins
        })
    },
    youtube: {
        color: 'from-red-600 to-red-800',
        stats: ['Subs', 'Videos', 'Views'],
        tips: 'Subscribers, Video Count, Channel Art',
        map: (d) => ({
            avatar: d.profile_pic,
            name: d.nickname,
            username: d.username,
            bio: d.bio,
            link: `https://youtube.com/@${d.username}`,
            verified: true,
            s1: d.stats.subscribers,
            s2: d.stats.videos,
            s3: d.stats.views
        })
    }
};

// UI Functions
function formatNumber(num) {
    if (!num) return '0';
    if (isNaN(num)) return num; // Return string as is (e.g. "1.2M")
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
}

function selectPlatform(platform) {
    currentPlatform = platform;
    
    // Update Active Button
    document.querySelectorAll('.platform-btn').forEach(btn => {
        if(btn.dataset.value === platform) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Update Tips & Labels
    const config = platformConfig[platform];
    const tipsHtml = `<li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> ${config.tips}</li>`;
    document.getElementById('capabilityList').innerHTML = tipsHtml;
    
    // Reset UI
    resetUI();
}

function setLoading(isLoading) {
    if (isLoading) {
        stalkBtn.disabled = true;
        stalkBtn.classList.add('opacity-50', 'cursor-not-allowed');
        loaderArea.classList.remove('hidden');
    } else {
        stalkBtn.disabled = false;
        stalkBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        loaderArea.classList.add('hidden');
    }
}

function showToast(msg, type) {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const msgEl = document.getElementById('toastMsg');
    
    icon.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`;
    icon.innerHTML = type === 'success' ? '✓' : '✕';
    
    msgEl.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Main Logic
stalkBtn.onclick = async () => {
    const username = usernameInput.value.trim();
    if (!username) return showToast("Please enter a username!", "error");

    setLoading(true);
    resetUI();

    try {
        const response = await fetch(`/api/stalk?type=${currentPlatform}&username=${username}`);
        const result = await response.json();

        if (!result.status) throw new Error(result.error || "User not found");

        const config = platformConfig[currentPlatform];
        const data = config.map(result.data); // Normalize data

        // Populate Data
        document.getElementById('resAvatar').src = data.avatar || 'https://via.placeholder.com/150';
        document.getElementById('resNickname').innerText = data.name || data.username;
        document.getElementById('resUsername').innerText = '@' + data.username;
        document.getElementById('resUsername').href = data.link;
        document.getElementById('resBio').innerText = data.bio || "No bio available.";
        document.getElementById('resLink').href = data.link;

        // Stats
        document.getElementById('lblStat1').innerText = config.stats[0];
        document.getElementById('valStat1').innerText = formatNumber(data.s1);
        document.getElementById('lblStat2').innerText = config.stats[1];
        document.getElementById('valStat2').innerText = formatNumber(data.s2);
        document.getElementById('lblStat3').innerText = config.stats[2];
        document.getElementById('valStat3').innerText = formatNumber(data.s3);

        // Verified Badge
        const verifiedEl = document.getElementById('resVerified');
        data.verified ? verifiedEl.classList.remove('hidden') : verifiedEl.classList.add('hidden');

        // Show Result
        emptyState.classList.add('hidden');
        resultArea.classList.remove('hidden');
        setTimeout(() => resultArea.classList.remove('opacity-0', 'translate-y-4'), 50);

        showToast(`${currentPlatform.toUpperCase()} Profile found!`, "success");

    } catch (err) {
        console.error(err);
        showToast(err.message || "Failed to fetch data", "error");
        emptyState.classList.remove('hidden');
    } finally {
        setLoading(false);
    }
};

function resetUI() {
    emptyState.classList.remove('hidden');
    resultArea.classList.add('hidden', 'opacity-0', 'translate-y-4');
}

usernameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        stalkBtn.click();
    }
});

selectPlatform('tiktok');
