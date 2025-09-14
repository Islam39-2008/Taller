// بيانات التمارين

const exercises = [
    { name: "إمالة الحوض", type: 'timer', duration: 60, description: "استلقِ على ظهرك مع ثني الركبتين. ارفع حوضك ببطء ثم أنزله.", image: "images/pelvic_shift.png" },
    { name: "القطة والجمل", type: 'reps', reps: 10, description: "ارتكز على يديك وركبتيك. قم بتقويس ظهرك للأعلى ثم للأسفل. كرر 10 مرات.", image: "images/cat_cow.png" },
    { name: "تمرين الكوبرا", type: 'timer', duration: 45, description: "استلقِ على بطنك. ارفع صدرك عن الأرض باستخدام ذراعيك مع الحفاظ على حوضك على الأرض.", image: "images/cobra.png" },
    { name: "التمرين المعلّق", type: 'timer', duration: 30, description: "تعلق بقضيب أو عقلة مع ترك جسمك يتدلى بحرية. اشعر بتمدد عمودك الفقري.", image: "images/hanging.png" },
    { name: "تمرين سوبرمان", type: 'timer', duration: 45, description: "استلقِ على بطنك. ارفع ذراعيك وساقيك وصدرك عن الأرض في نفس الوقت.", image: "images/superman.png" },
    { name: "الانحناء الأمامي", type: 'timer', duration: 60, description: "قف بشكل مستقيم ثم انحنِ للأمام من عند الخصر وحاول لمس أصابع قدميك. حافظ على استقامة ظهرك قدر الإمكان.", image: "images/forward_bend.png" },
    { name: "وضعية الطفل", type: 'timer', duration: 90, description: "اجلس على ركبتيك ومد جسمك للأمام على الأرض. استرخ تمامًا.", image: "images/child_pose.png" }
];
// المتغيرات الرئيسية
let currentExerciseIndex = 0;
let isPlaying = false;
let isPaused = false;
let currentTime = 0;
let currentReps = 0;
let totalElapsedTime = 0;
let timerInterval = null;
let restInterval = null;

// عناصر DOM
const exerciseName = document.getElementById('exerciseName');
const exerciseImage = document.getElementById('exerciseImage');
const exerciseDescription = document.getElementById('exerciseDescription');
const timerDisplay = document.getElementById('timerDisplay');
const repsDisplay = document.getElementById('repsDisplay');
const timeLeft = document.getElementById('timeLeft');
const currentRepsEl = document.getElementById('currentReps');
const totalRepsEl = document.getElementById('totalReps');
const progressFill = document.getElementById('progressFill');
const playPauseBtn = document.getElementById('playPauseBtn');
const completeBtn = document.getElementById('completeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const restScreen = document.getElementById('restScreen');
const restTime = document.getElementById('restTime');
const nextExerciseName = document.getElementById('nextExerciseName');
const skipRestBtn = document.getElementById('skipRestBtn');
const currentExerciseNum = document.getElementById('currentExerciseNum');
const totalExercises = document.getElementById('totalExercises');
const totalTime = document.getElementById('totalTime');
const themeToggle = document.getElementById('themeToggle');


//mosic
const audio_playing = document.getElementById('player_playing');
const audio_complete_to_rust = document.getElementById('player_complet_to_rust');


// صوت النقر العام
const clickSound = document.getElementById('clickSound');

function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => {
        console.log("فشل تشغيل صوت النقر:", e);
    });
}
// ربط الصوت بكل الأزرار
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', playClickSound);
});


// الموسيقى الخلفية
const backgroundMusic = document.getElementById('backgroundMusic');
const toggleMusicBtn = document.getElementById('toggleMusicBtn');

// دالة تبديل تشغيل/إيقاف الموسيقى
function toggleBackgroundMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.play().then(() => {
            toggleMusicBtn.textContent = "⏸️ إيقاف الموسيقى";
            toggleMusicBtn.classList.add('playing');
        }).catch(e => {
            console.warn("فشل تشغيل الموسيقى — قد يحتاج تفاعل مستخدم أولًا:", e);
            alert("يرجى النقر على أي زر في الصفحة أولاً لتفعيل الصوت.");
        });
    } else {
        backgroundMusic.pause();
        toggleMusicBtn.textContent = "🎵 تشغيل الموسيقى";
        toggleMusicBtn.classList.remove('playing');
    }
}

// ربط الزر بالدالة
toggleMusicBtn.addEventListener('click', toggleBackgroundMusic);
//----------------------


// تهيئة الصفحة
function init() {
    totalExercises.textContent = exercises.length;
    loadExercise();
    loadTheme();
    updateTotalTime();
}

// تحميل التمرين
function loadExercise() {
    const exercise = exercises[currentExerciseIndex];
    
    exerciseName.textContent = exercise.name;
    exerciseImage.src = exercise.image;
    exerciseDescription.textContent = exercise.description;
    currentExerciseNum.textContent = currentExerciseIndex + 1;
    
    resetExercise();
    
    if (exercise.type === 'timer') {
        timerDisplay.style.display = 'block';
        repsDisplay.style.display = 'none';
        completeBtn.style.display = 'none';
        playPauseBtn.style.display = 'inline-block';
        timeLeft.textContent = exercise.duration;
        currentTime = exercise.duration;
    }else {
        timerDisplay.style.display = 'none';
        repsDisplay.style.display = 'block';
        completeBtn.style.display = 'inline-block';
        playPauseBtn.style.display = 'none';
        currentRepsEl.textContent = 0;
        totalRepsEl.textContent = exercise.reps;
        currentReps = 0;
    }
    
    updateProgressBar();
    updateButtonStates();
}

// إعادة تعيين التمرين
// إعادة تعيين التمرين — إضافة إيقاف الصوت
function resetExercise() {
    isPlaying = false;
    isPaused = false;
    clearInterval(timerInterval);
    playPauseBtn.innerHTML = '▶️ بدء';
    progressFill.style.width = '0%';
    // تم التعديل: ضمان إيقاف موسيقى التشغيل عند أي إعادة تعيين
    if (audio_playing) audio_playing.pause();
}

// بدء/إيقاف المؤقت
function toggleTimer() {
    const exercise = exercises[currentExerciseIndex];
    
    if (exercise.type !== 'timer') return;
    
    if (!isPlaying) {
        startTimer();
    } else if (!isPaused) {
        pauseTimer();
    } else {
        resumeTimer();
    }
}

// بدء المؤقت
function startTimer() {
    isPlaying = true;
    isPaused = false;
    playPauseBtn.innerHTML = '⏸️ إيقاف';
    audio_playing.play()
    timerInterval = setInterval(() => {
        currentTime--;
        timeLeft.textContent = currentTime;
        updateProgressBar();
        totalElapsedTime++;
        updateTotalTime();
        
        if (currentTime <= 0) {
            clearInterval(timerInterval);
            completeExercise();
        }
    }, 1000);
}

// إيقاف المؤقت مؤقتاً
function pauseTimer() {
    isPaused = true;
    clearInterval(timerInterval);
    playPauseBtn.innerHTML = '▶️ استئناف';
    audio_playing.pause();
}

// استئناف المؤقّت — إزالة تشغيل الصوت المكرر
function resumeTimer() {
    isPaused = false;
    playPauseBtn.innerHTML = '⏸️ إيقاف';
    startTimer(); // startTimer سيقوم بتشغيل الصوت بالفعل
    // تم الحذف: audio_playing.play();
}

// إكمال العدّات — إزالة تشغيل الأصوات في كل نقرة والاكتفاء بصوت الانتقال عند الإتمام
function completeReps() {
    const exercise = exercises[currentExerciseIndex];
    if (exercise.type !== 'reps') return;

    // تم الحذف: audio_playing.play();
    // تم الحذف: audio_complete_to_rust.play();

    currentReps++;
    currentRepsEl.textContent = currentReps;
    updateProgressBar();
    
    if (currentReps >= exercise.reps) {
        // سيتم تشغيل صوت الانتقال وإيقاف الموسيقى داخل completeExercise()
        completeExercise();

        // تم الحذف: audio_playing.pause();
        // تم الحذف: audio_complete_to_rust.play();
    }
}

// إكمال التمرين
function completeExercise() {
    resetExercise();
    //

        //
    if (currentExerciseIndex < exercises.length - 1) {
        showRestScreen();
        audio_complete_to_rust.play();
        audio_playing.pause();
    } else {
        showCompletionMessage();
        audio_complete_to_rust.play();
        audio_playing.pause();


    }
}

// عرض شاشة الاستراحة
function showRestScreen() {
    let restTimeLeft = 20;
    restTime.textContent = restTimeLeft;
    nextExerciseName.textContent = exercises[currentExerciseIndex + 1].name;
    restScreen.style.display = 'flex';

    audio_playing.pause();

    restInterval = setInterval(() => {
        restTimeLeft--;
        restTime.textContent = restTimeLeft;
        
        if (restTimeLeft <= 0) {

            hideRestScreen();
            nextExercise();
        }
    }, 1000);
}

// إخفاء شاشة الاستراحة
function hideRestScreen() {
    clearInterval(restInterval);
    restScreen.style.display = 'none';
    audio_complete_to_rust.pause()
}

// تخطي الاستراحة
function skipRest() {
    hideRestScreen();
    nextExercise();
}

// التمرين التالي
function nextExercise() {
    if (currentExerciseIndex < exercises.length - 1) {
        currentExerciseIndex++;
        loadExercise();
    }
}

// التمرين السابق — إيقاف الصوت عند الرجوع
function previousExercise() {
    if (currentExerciseIndex > 0) {
        // تم الإضافة: إيقاف موسيقى التشغيل عند الرجوع للتمرين السابق
        if (audio_playing) audio_playing.pause();
        currentExerciseIndex--;
        loadExercise();
    }
}

// تحديث شريط التقدم
function updateProgressBar() {
    const exercise = exercises[currentExerciseIndex];
    let progress = 0;
    
    if (exercise.type === 'timer') {
        progress = ((exercise.duration - currentTime) / exercise.duration) * 100;
    } else {
        progress = (currentReps / exercise.reps) * 100;
    }
    
    progressFill.style.width = `${progress}%`;
}

// تحديث حالة الأزرار
function updateButtonStates() {
    prevBtn.disabled = currentExerciseIndex === 0;
    nextBtn.disabled = currentExerciseIndex === exercises.length - 1;
}

// تحديث الوقت الكلي
function updateTotalTime() {
    const minutes = Math.floor(totalElapsedTime / 60);
    const seconds = totalElapsedTime % 60;
    totalTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// عرض رسالة الإنجاز
function showCompletionMessage() {
    alert('تهانينا! لقد أكملت جميع التمارين بنجاح! 🎉');
}

// تبديل السمة
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// تحميل السمة المحفوظة
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// مستمعات الأحداث
playPauseBtn.addEventListener('click', toggleTimer);
completeBtn.addEventListener('click', completeReps);
prevBtn.addEventListener('click', previousExercise);
nextBtn.addEventListener('click', () => {
    if (isPlaying) {
        resetExercise();
    }
    nextExercise();
});
skipRestBtn.addEventListener('click', skipRest);
themeToggle.addEventListener('click', toggleTheme);

// اختصارات لوحة المفاتيح
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case ' ':
            e.preventDefault();
            if (exercises[currentExerciseIndex].type === 'timer') {
                toggleTimer();
            } else {
                completeReps();
            }
            break;
        case 'ArrowRight':
            if (!prevBtn.disabled) previousExercise();
            break;
        case 'ArrowLeft':
            if (!nextBtn.disabled) nextExercise();
            break;
    }
});

// تهيئة الصفحة عند التحميل
init();