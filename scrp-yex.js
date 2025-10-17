let humans = [];
let attendance = {};

//Auto-load humans.json from current directory on page load
window.addEventListener('DOMContentLoaded', () => {
    autoLoadJSON();
});

//Auto-load JSON file
async function autoLoadJSON() {
    try {
        const response = await fetch('humans-xD.json');
        if (!response.ok) {
            throw new Error('JSON file not found');
        }
        
        const data = await response.json();
        humans = data;
        attendance = {};

        humans.forEach((human, index) => {
            attendance[index] = null; //null = unmarked, true = present, false = absent
        });

        displayhumans();
        updateStats();
        document.getElementById('fileInfo').textContent = ` Auto-loaded ${humans.length} humans from humans.json`;
        document.getElementById('statsSection').classList.remove('hidden');
        document.getElementById('downloadSection').classList.remove('hidden');
        document.getElementById('bulkActions').classList.remove('hidden');
    } catch (error) {
        console.log('Auto-load failed, waiting for manual upload:', error.message);
        document.getElementById('fileInfo').textContent = ' humans.json not found. Please upload manually.';
        document.getElementById('fileInfo').style.color = '#f59e0b';
    }
}

//Manual file upload handler (fallback)
document.getElementById('jsonFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            humans = JSON.parse(event.target.result);
            attendance = {};

            humans.forEach((human, index) => {
                attendance[index] = null;
            });

            displayhumans();
            updateStats();
            document.getElementById('fileInfo').textContent = ` Loaded ${humans.length} humans from ${file.name}`;
            document.getElementById('fileInfo').style.color = '#10b981';
            document.getElementById('statsSection').classList.remove('hidden');
            document.getElementById('downloadSection').classList.remove('hidden');
            document.getElementById('bulkActions').classList.remove('hidden');
        } catch (error) {
            alert('Error parsing JSON file. Please check the format.');
            console.error(error);
        }
    };
    reader.readAsText(file);
});

//Bulk action buttons
document.getElementById('markAllPresent').addEventListener('click', () => {
    humans.forEach((human, index) => {
        attendance[index] = true;
    });
    displayhumans();
    updateStats();
});

document.getElementById('markAllAbsent').addEventListener('click', () => {
    humans.forEach((human, index) => {
        attendance[index] = false;
    });
    displayhumans();
    updateStats();
});

document.getElementById('clearAll').addEventListener('click', () => {
    humans.forEach((human, index) => {
        attendance[index] = null;
    });
    displayhumans();
    updateStats();
});

//Display humans
function displayhumans() {
    const listContainer = document.getElementById('humanList');
    listContainer.innerHTML = '';

    humans.forEach((human, index) => {
        const card = document.createElement('div');
        card.className = 'human-card';
        
        if (attendance[index] === true) {
            card.classList.add('marked-present');
        } else if (attendance[index] === false) {
            card.classList.add('marked-absent');
        }

        card.innerHTML = `
            <div class="human-info">
                <div class="human-name">${human.name}</div>
                <div class="human-details">
                    <span> Roll: ${human.rollNo}</span>
                    <span> Enrollment: ${human.enrollmentNo}</span>
                </div>
            </div>
            <div class="attendance-controls">
                <div class="radio-group present">
                    <input type="radio" name="attendance-${index}" id="present-${index}" value="present" ${attendance[index] === true ? 'checked' : ''}>
                    <label for="present-${index}"> Present</label>
                </div>
                <div class="radio-group absent">
                    <input type="radio" name="attendance-${index}" id="absent-${index}" value="absent" ${attendance[index] === false ? 'checked' : ''}>
                    <label for="absent-${index}"> Absent</label>
                </div>
            </div>
        `;

        const humanInfo = card.querySelector('.human-info');
        humanInfo.style.cursor = 'pointer';
        humanInfo.addEventListener('click', () => {
            toggleAttendance(index, card);
        });

        const presentRadio = card.querySelector(`#present-${index}`);
        const absentRadio = card.querySelector(`#absent-${index}`);

        presentRadio.addEventListener('change', () => {
            attendance[index] = true;
            updateStats();
            card.classList.remove('marked-absent');
            card.classList.add('marked-present');
            if (!textView.classList.contains('hidden')) renderAndCopyReport();
        });

        absentRadio.addEventListener('change', () => {
            attendance[index] = false;
            updateStats();
            card.classList.remove('marked-present');
            card.classList.add('marked-absent');
            if (!textView.classList.contains('hidden')) renderAndCopyReport();
        });

        listContainer.appendChild(card);
    });
}

//Toggle attendance status on click
function toggleAttendance(index, card) {
    if (attendance[index] === null) {
        attendance[index] = true;
        card.classList.add('marked-present');
        card.classList.remove('marked-absent');
        document.getElementById(`present-${index}`).checked = true;
    } else if (attendance[index] === true) {
        attendance[index] = false;
        card.classList.add('marked-absent');
        card.classList.remove('marked-present');
        document.getElementById(`absent-${index}`).checked = true;
    } else {
        attendance[index] = null;
        card.classList.remove('marked-present');
        card.classList.remove('marked-absent');
        document.getElementById(`present-${index}`).checked = false;
        document.getElementById(`absent-${index}`).checked = false;
    }
    updateStats();
    if (!textView.classList.contains('hidden')) renderAndCopyReport();
}

//Update statistics
function updateStats() {
    const total = humans.length;
    let present = 0;
    let absent = 0;
    let unmarked = 0;

    Object.values(attendance).forEach(status => {
        if (status === true) present++;
        else if (status === false) absent++;
        else unmarked++;
    });

    document.getElementById('totalhumans').textContent = total;
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent;
    document.getElementById('unmarkedCount').textContent = unmarked;
}

//Get attendance status text
function getStatusText(index) {
    if (attendance[index] === true) return 'Present';
    if (attendance[index] === false) return 'Absent';
    return 'Unmarked';
}

//Get filtered data based on options
function getFilteredData() {
    const showPresentOnly = document.getElementById('showPresentOnly').checked;
    const includeName = document.getElementById('includeName').checked;
    const includeRollNo = document.getElementById('includeRollNo').checked;
    const includeEnrollment = document.getElementById('includeEnrollment').checked;
    const includeStatus = document.getElementById('includeStatus').checked;

    const filteredData = [];

    humans.forEach((human, index) => {
        if (showPresentOnly && attendance[index] !== true) return;

        const row = {};
        if (includeName) row['Name'] = human.name;
        if (includeRollNo) row['Roll No'] = human.rollNo;
        if (includeEnrollment) row['Enrollment No'] = human.enrollmentNo;
        if (includeStatus) row['Status'] = getStatusText(index);

        filteredData.push(row);
    });

    return filteredData;
}

//Download as Excel
document.getElementById('downloadExcel').addEventListener('click', () => {
    const data = getFilteredData();
    
    if (data.length === 0) {
        alert('No data to export. Please check your filter options.');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `attendance_${timestamp}.xlsx`);
});

//Download as Text
document.getElementById('downloadTxt').addEventListener('click', () => {
    const data = getFilteredData();
    
    if (data.length === 0) {
        alert('No data to export. Please check your filter options.');
        return;
    }

    let textContent = 'ATTENDANCE REPORT\n';
    textContent += '='.repeat(50) + '\n';
    textContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    data.forEach((human, index) => {
        textContent += `${index + 1}. `;
        Object.entries(human).forEach(([key, value]) => {
            textContent += `${key}: ${value} | `;
        });
        textContent = textContent.slice(0, -3) + '\n';
    });

    textContent += '\n' + '='.repeat(50) + '\n';
    textContent += `Total Records: ${data.length}`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    a.download = `attendance_${timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

//View as Text and Copy to Clipboard
async function renderAndCopyReport() {
  const data = getFilteredData();
  if (data.length === 0) {
    document.getElementById('textView').textContent = 'No records to display.';
    return;
  }

  let textContent = 'ATTENDANCE REPORT\n';
  textContent += '='.repeat(50) + '\n';
  textContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

  data.forEach((human, index) => {
    textContent += `${index + 1}. `;
    Object.entries(human).forEach(([key, value]) => {
      textContent += `${key}: ${value} | `;
    });
    textContent = textContent.slice(0, -3) + '\n';
  });

  textContent += '\n' + '='.repeat(50) + '\n';
  textContent += `Total Records: ${data.length}`;

  const textView = document.getElementById('textView');
  textView.textContent = textContent;
  textView.classList.remove('hidden');
  //textView.scrollIntoView({ behavior: 'smooth' });

  try {
    await navigator.clipboard.writeText(textContent);
    const badge = document.createElement('div');
    badge.textContent = 'Copied to clipboard!';
    badge.style.cssText = 'position:absolute;top:1rem;right:1rem;color:#34d399;font-weight:600;';
    textView.prepend(badge);
    setTimeout(() => badge.remove(), 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

document.getElementById('viewText').addEventListener('click', renderAndCopyReport);
if (!document.getElementById('textView').classList.contains('hidden')) {
  renderAndCopyReport();
}

['includeName','includeRollNo','includeEnrollment','includeStatus'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    if (!document.getElementById('textView').classList.contains('hidden')) {
      renderAndCopyReport();
    }
  });
});

document.getElementById('showPresentOnly').addEventListener('change', () => {
  if (!document.getElementById('textView').classList.contains('hidden')) {
    renderAndCopyReport();
  }
});
