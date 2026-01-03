const stalkBtn = document.getElementById('stalkBtn');
const usernameInput = document.getElementById('usernameInput');
const loaderArea = document.getElementById('loaderArea');
const statusText = document.getElementById('statusText');
const emptyState = document.getElementById('emptyState');
const resultArea = document.getElementById('resultArea');

function formatNumber(num) {
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
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0";
    
    if (type === 'success') {
        icon.className = `${baseClasses} bg-green-500/20 text-green-500`;
        icon.innerHTML = '✓';
    } else {
        icon.className = `${baseClasses} bg-red-500/20 text-red-500`;
        icon.innerHTML = '✕';
    }
    
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
        const response = await fetch(`/api/stalk?username=${username}`);
        const result = await response.json();

        if (!result.status) {
            throw new Error(result.error || "User not found");
        }

        const data = result.data;
        const user = data.user || data; 
        const stats = data.stats || user.stats;

        document.getElementById('resAvatar').src = user.avatarLarger || user.avatarMedium || user.avatarThumb;
        document.getElementById('resNickname').innerText = user.nickname;
        document.getElementById('resUsername').innerText = '@' + (user.uniqueId || username);
        document.getElementById('resBio').innerText = user.signature || "No bio available.";
        
        document.getElementById('resFollowers').innerText = formatNumber(stats.followerCount);
        document.getElementById('resFollowing').innerText = formatNumber(stats.followingCount);
        document.getElementById('resLikes').innerText = formatNumber(stats.heartCount);
        
        document.getElementById('resLink').href = `https://tiktok.com/@${user.uniqueId || username}`;

        const verifiedEl = document.getElementById('resVerified');
        if (user.verified) {
            verifiedEl.classList.remove('hidden');
        } else {
            verifiedEl.classList.add('hidden');
        }

        emptyState.classList.add('hidden');
        resultArea.classList.remove('hidden');
        
        setTimeout(() => {
            resultArea.classList.remove('opacity-0', 'translate-y-4');
        }, 50);

        showToast("Profile found!", "success");

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

usernameInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    stalkBtn.click();
  }
});