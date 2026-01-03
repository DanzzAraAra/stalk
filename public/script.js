const stalkBtn = document.getElementById('stalkBtn');
const usernameInput = document.getElementById('usernameInput');
const platformSelect = document.getElementById('platformSelect'); // Element Baru
const loaderArea = document.getElementById('loaderArea');
const emptyState = document.getElementById('emptyState');
const resultArea = document.getElementById('resultArea');

// Default placeholder avatar
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random&color=fff&name=User';

let currentPlatform = 'tiktok';

const platformConfig = {
    tiktok: {
        color: 'from-pink-500 to-cyan-500',
        stats: ['Followers', 'Following', 'Likes'],
        tips: 'Profile Pic HD, Follower Stats, Bio',
        map: (d) => ({
            // Fallback: Jika avatarLarger tidak ada, coba avatarMedium, lalu default
            avatar: d.avatarLarger || d.avatarMedium || DEFAULT_AVATAR,
            // Fallback: Jika nickname kosong, pakai uniqueId
            name: d.nickname || d.uniqueId || 'TikTok User',
            username: d.uniqueId || '-',
            bio: d.signature || 'No bio available.',
            link: `https://tiktok.com/@${d.uniqueId}`,
            verified: d.verified || false,
            s1: d.stats?.followerCount || 0,
            s2: d.stats?.followingCount || 0,
            s3: d.stats?.heartCount || 0
        })
    },
    github: {
        color: 'from-gray-600 to-gray-900',
        stats: ['Followers', 'Following', 'Repos'],
        tips: 'Public Repos, Bio, Company',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username || 'GitHub User',
            username: d.username || '-',
            bio: d.bio || 'No bio available.',
            link: d.url || '#',
            verified: false,
            s1: d.stats?.followers || 0,
            s2: d.stats?.following || 0,
            s3: d.stats?.repos || 0
        })
    },
    instagram: {
        color: 'from-purple-500 to-orange-500',
        stats: ['Followers', 'Following', 'Posts'],
        tips: 'Posts Count, Bio, Verified Status',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username || 'Instagram User',
            username: d.username || '-',
            bio: d.bio || 'No bio available.',
            link: `https://instagram.com/${d.username}`,
            verified: d.is_verified || false,
            s1: d.stats?.followers || 0,
            s2: d.stats?.following || 0,
            s3: d.stats?.posts || 0
        })
    },
    twitter: {
        color: 'from-blue-400 to-blue-600',
        stats: ['Followers', 'Following', 'Tweets'],
        tips: 'Tweets Count, Verified Status, Bio',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username || 'Twitter User',
            username: d.username || '-',
            bio: d.bio || 'No bio available.',
            link: `https://x.com/${d.username}`,
            verified: d.is_verified || false,
            s1: d.stats?.followers || 0,
            s2: d.stats?.following || 0,
            s3: d.stats?.tweets || 0
        })
    },
    pinterest: {
        color: 'from-red-500 to-red-700',
        stats: ['Followers', 'Following', 'Pins'],
        tips: 'Saved Pins, Boards, Bio',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username || 'Pinterest User',
            username: d.username || '-',
            bio: d.bio || 'No bio available.',
            link: `https://pinterest.com/${d.username}`,
            verified: d.is_verified || false,
            s1: d.stats?.followers || 0,
            s2: d.stats?.following || 0,
            s3: d.stats?.pins || 0
        })
    },
    youtube: {
        color: 'from-red-600 to-red-800',
        stats: ['Subs', 'Videos', 'Views'],
        tips: 'Subscribers, Video Count, Channel Art',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username || 'YouTuber',
            username: d.username || 'Channel',
            bio: d.bio || 'No description.',
            link: `https://youtube.com/@${d.username}`,
            verified: true,
            s1: d.stats?.subscribers || '0',
            s2: d.stats?.videos || '0',
            s3: d.stats?.views || '0'
        })
    }
};

// UI Functions
function formatNumber(num) {
    if (!num) return '0';
    if (typeof num === 'string') {
        // Jika sudah string (misal dari YouTube "1.2M"), kembalikan saja
        return num.length > 10 ? num.substring(0, 10) + '..' : num;
    }
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
}

function updatePlatformInfo(platform) {
    currentPlatform = platform;
    const config = platformConfig[platform];
    
    // Update Tips & Labels
    const tipsHtml = `<li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> ${config.tips}</li>`;
    document.getElementById('capabilityList').innerHTML = tipsHtml;
    
    resetUI();
}

// Listen to Select Change
platformSelect.addEventListener('change', (e) => {
    updatePlatformInfo(e.target.value);
});

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
        // Mapping data dengan logika fallback yang sudah diperbaiki
        const data = config.map(result.data); 

        // Populate Data
        document.getElementById('resAvatar').src = data.avatar;
        document.getElementById('resNickname').innerText = data.name;
        document.getElementById('resUsername').innerText = '@' + data.username;
        document.getElementById('resUsername').href = data.link;
        document.getElementById('resBio').innerText = data.bio;
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

updatePlatformInfo('tiktok');
