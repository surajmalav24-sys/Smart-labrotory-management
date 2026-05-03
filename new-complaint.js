const user = JSON.parse(sessionStorage.getItem('campuscare-user') || 'null');
if (!user) {
  window.location.href = 'index.html';
}

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dlkb6eps7/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'w9xtzf5z';

// 🎯 EXACT IDs JO AAPKE HTML MEIN HAIN
const complaintForm = document.getElementById('complaint-form');
const aiPanel = document.getElementById('ai-panel'); 
const aiResponseText = document.getElementById('ai-response-text'); 
const actionButtons = document.querySelector('.ai-action-buttons'); // class se select kiya hai
const submitBtn = document.getElementById('submit-btn');

let currentImageUrl = '';
let currentTitle = '';

// Form Submit Event
complaintForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing with AI...';
  
  // UI Update - Panel dikhana aur Glow shuru karna
  aiPanel.style.display = 'block';
  aiResponseText.classList.add('analyzing');
  aiResponseText.innerHTML = "Analyzing your issue and details... Please wait 🤖";
  actionButtons.style.display = 'none'; // Jab tak soch raha hai, buttons chupa do

  currentTitle = document.getElementById('complaint-title').value.trim();
  const imageInput = document.getElementById('complaint-image');
  
  // Safety check for image
  let imageFile = null;
  if(imageInput && imageInput.files.length > 0){
      imageFile = imageInput.files[0];
  }

  try {
    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryRes = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
        const cloudinaryData = await cloudinaryRes.json();
        
        if (!cloudinaryRes.ok) throw new Error("Image Upload Failed.");
        currentImageUrl = cloudinaryData.secure_url;
    } else {
        currentImageUrl = "No Image Uploaded";
    }

    // AI Simulation (Smart Replies)
    setTimeout(() => {
      let aiText = "";
      const lowerTitle = currentTitle.toLowerCase();

      if (lowerTitle.includes('mouse') || lowerTitle.includes('keyboard')) {
        aiText = "<strong>💡 AI Suggestion:</strong><br>1. Unplug the USB cable and try a different port.<br>2. Check if the wire is physically cut or damaged.";
      } else if (lowerTitle.includes('monitor') || lowerTitle.includes('screen') || lowerTitle.includes('display')) {
        aiText = "<strong>💡 AI Suggestion:</strong><br>1. Ensure the power cable and VGA/HDMI cables are tightly connected.<br>2. Check if the monitor's power light is turning on.";
      } else if (lowerTitle.includes('internet') || lowerTitle.includes('network') || lowerTitle.includes('wifi')) {
        aiText = "<strong>💡 AI Suggestion:</strong><br>1. Check if the LAN cable is properly plugged into the PC.<br>2. Restart the network router or switch in the lab.";
      } else if (lowerTitle.includes('boot') || lowerTitle.includes('start') || lowerTitle.includes('power')) {
        aiText = "<strong>💡 AI Suggestion:</strong><br>1. Check the main power switch and power cable connection.<br>2. Listen for any beep sounds when pressing the power button.";
      } else {
        aiText = "<strong>💡 AI Suggestion:</strong><br>1. Restart the system and check if the issue persists.<br>2. Ensure all external cables are securely plugged in.";
      }

      // Glow band karo aur text dikhao
      aiResponseText.classList.remove('analyzing');
      aiResponseText.innerHTML = aiText; 
      
      // Buttons dikhao
      actionButtons.style.display = 'flex';
      
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Another';
    }, 3000); // 3 seconds wait

  } catch (error) {
    console.error("Error:", error);
    aiResponseText.classList.remove('analyzing');
    aiResponseText.innerHTML = `<span style="color:red;"><b>Error:</b> ${error.message}</span>`;
    actionButtons.style.display = 'flex';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Try Again';
  }
});

// Buttons Click Events
document.getElementById('resolved-by-ai-btn').addEventListener('click', (e) => {
  e.preventDefault();
  alert("Great! Issue resolved by AI. No complaint registered. Time saved! ✅");
  window.location.href = 'dashboard.html'; // wapas dashboard bhej do
});

document.getElementById('need-tech-btn').addEventListener('click', (e) => {
  e.preventDefault();
  createTicket(currentTitle, "Open", currentImageUrl);
});

// Complaint create karne ka aur Email bhejne ka function
function createTicket(title, status, imageUrl) {
  const complaints = JSON.parse(localStorage.getItem('campuscare-complaints') || '[]');
  const category = document.getElementById('complaint-category').value;
  const department = document.getElementById('complaint-department').value.trim();

  complaints.unshift({
    id: Date.now(),
    title: title,
    status: status,
    category: category,
    department: department,
    date: new Date().toISOString().slice(0, 10),
    technician: 'Unassigned',
    image: imageUrl 
  });

  localStorage.setItem('campuscare-complaints', JSON.stringify(complaints));
  
  const techBtn = document.getElementById('need-tech-btn');
  techBtn.textContent = 'Sending Alert... 🚀';
  
  // 🛑 Email JS Initialise
  emailjs.init("fpLh4t66fn_3IkXrA"); 
  
  const templateParams = {
      title: title,
      department: department,
      image_url: imageUrl
  };

  emailjs.send("service_fbnnf6n", "template_80ptdfe", templateParams)
  .then(function() {
      alert("Complaint Registered! An Email Alert has been sent to the Technician. 📧");
      window.location.href = 'dashboard.html';
  }, function(error) {
      console.error("Email Error:", error);
      alert("Complaint Registered, but failed to send email.");
      window.location.href = 'dashboard.html';
  });
}