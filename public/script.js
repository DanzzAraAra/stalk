const stalkBtn = document.getElementById('stalkBtn');
const usernameInput = document.getElementById('usernameInput');
const loaderArea = document.getElementById('loaderArea');
const emptyState = document.getElementById('emptyState');
const resultArea = document.getElementById('resultArea');
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random&color=fff&name=User';

let currentPlatform = 'tiktok';

const platformConfig = {
    tiktok: {
        stats: ['Followers', 'Following', 'Likes'],
        tips: 'Profile Pic HD, Follower Stats, Bio',
        map: (d) => ({
            avatar: d.avatarLarger || d.avatarMedium || DEFAULT_AVATAR,
            name: d.nickname || d.uniqueId || 'TikTok User',
            username: d.uniqueId || '-',
            bio: d.signature || 'No bio available.',
            link: `https://tiktok.com/@${d.uniqueId}`,
            verified: d.verified,
            s1: d.stats?.followerCount || 0,
            s2: d.stats?.followingCount || 0,
            s3: d.stats?.heartCount || 0
        })
    },
    roblox: {
        stats: ['Friends', 'Followers', 'Following'],
        tips: 'Avatar Headshot, Friends Count, Bio',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username || 'Roblox Player',
            username: d.username,
            bio: d.bio || 'No bio available.',
            link: d.url,
            verified: false,
            s1: d.stats?.friends || 0,
            s2: d.stats?.followers || 0,
            s3: d.stats?.following || 0
        })
    },
    github: {
        stats: ['Followers', 'Following', 'Repos'],
        tips: 'Public Repos, Bio, Company',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username,
            username: d.username,
            bio: d.bio,
            link: d.url,
            verified: false,
            s1: d.stats?.followers || 0,
            s2: d.stats?.following || 0,
            s3: d.stats?.repos || 0
        })
    },
    instagram: {
        stats: ['Followers', 'Following', 'Posts'],
        tips: 'Posts Count, Bio, Verified Status',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username,
            username: d.username,
            bio: d.bio,
            link: `https://instagram.com/${d.username}`,
            verified: d.is_verified,
            s1: d.stats?.followers || 0,
            s2: d.stats?.following || 0,
            s3: d.stats?.posts || 0
        })
    },
    twitter: {
        stats: ['Followers', 'Following', 'Tweets'],
        tips: 'Tweets Count, Verified Status, Bio',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username,
            username: d.username,
            bio: d.bio,
            link: `https://x.com/${d.username}`,
            verified: d.is_verified,
            s1: d.stats?.followers || 0,
            s2: d.stats?.following || 0,
            s3: d.stats?.tweets || 0
        })
    },
    pinterest: {
        stats: ['Followers', 'Following', 'Pins'],
        tips: 'Saved Pins, Boards, Bio',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username,
            username: d.username,
            bio: d.bio,
            link: `https://pinterest.com/${d.username}`,
            verified: d.is_verified,
            s1: d.stats?.followers || 0,
            s2: d.stats?.following || 0,
            s3: d.stats?.pins || 0
        })
    },
    youtube: {
        stats: ['Subs', 'Videos', 'Views'],
        tips: 'Subscribers, Video Count, Channel Art',
        map: (d) => ({
            avatar: d.profile_pic || DEFAULT_AVATAR,
            name: d.nickname || d.username,
            username: d.username,
            bio: d.bio,
            link: `https://youtube.com/@${d.username}`,
            verified: true,
            s1: d.stats?.subscribers || '0',
            s2: d.stats?.videos || '0',
            s3: d.stats?.views || '0'
        })
    }
};

const trigger = document.getElementById('platformTrigger');
const options = document.getElementById('platformOptions');
const arrow = document.getElementById('dropdownArrow');
const selectedText = document.getElementById('selectedText');
const selectedIcon = document.getElementById('selectedIcon');

trigger.addEventListener('click', (e) => {
    const isOpen = options.classList.contains('open');
    if (isOpen) closeDropdown();
    else openDropdown();
    e.stopPropagation();
});

function openDropdown() {
    options.classList.add('open');
    arrow.classList.add('rotate');
}

function closeDropdown() {
    options.classList.remove('open');
    arrow.classList.remove('rotate');
}

document.addEventListener('click', () => closeDropdown());

document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
        const val = this.dataset.value;
        const iconClass = this.dataset.icon;
        const text = this.querySelector('span').innerText;

        currentPlatform = val;
        
        selectedText.innerText = text;
        selectedIcon.innerHTML = `<i class="fa-brands ${iconClass} ${val === 'roblox' ? 'fa-solid' : ''}"></i>`;
        
        updatePlatformInfo(val);
        closeDropdown();
    });
});

function updatePlatformInfo(platform) {
    const config = platformConfig[platform];
    const tipsHtml = `<li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> ${config.tips}</li>`;
    document.getElementById('capabilityList').innerHTML = tipsHtml;
    resetUI();
}

function formatNumber(num) {
    if (!num) return '0';
    if (typeof num === 'string') return num.length > 10 ? num.substring(0, 10) + '..' : num;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
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
        const data = config.map(result.data);

        document.getElementById('resAvatar').src = data.avatar;
        document.getElementById('resNickname').innerText = data.name;
        document.getElementById('resUsername').innerText = '@' + data.username;
        document.getElementById('resUsername').href = data.link;
        document.getElementById('resBio').innerText = data.bio;
        document.getElementById('resLink').href = data.link;

        document.getElementById('lblStat1').innerText = config.stats[0];
        document.getElementById('valStat1').innerText = formatNumber(data.s1);
        document.getElementById('lblStat2').innerText = config.stats[1];
        document.getElementById('valStat2').innerText = formatNumber(data.s2);
        document.getElementById('lblStat3').innerText = config.stats[2];
        document.getElementById('valStat3').innerText = formatNumber(data.s3);

        const verifiedEl = document.getElementById('resVerified');
        data.verified ? verifiedEl.classList.remove('hidden') : verifiedEl.classList.add('hidden');

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
