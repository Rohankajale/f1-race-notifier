const notify = document.getElementById('notification')
console.log(notify.checked)
console.log(Notification.permission)

const loadDrivers = async () => {
  const urlDrivers = 'https://api.openf1.org/v1/drivers?session_key=latest'
  const urlChampionshipDrivers = 'https://api.openf1.org/v1/championship_drivers?session_key=latest'
      
  const [response1, response2] = await Promise.all([fetch(urlDrivers), fetch(urlChampionshipDrivers)])

  if (!response1.ok || !response2.ok) {
    const container = document.getElementById('drivers')
    const row = document.createElement('tr')
    const td = document.createElement('td')
    td.colSpan = 5
    td.className = 'py-6 px-4 text-center'
    td.style.backgroundColor = '#0F172A'
    td.style.color = '#ffffff'
    td.textContent = '🏎️ Results will be available after the current session ends.'
    row.appendChild(td)
    container.appendChild(row)
    return
  }
  
  const drivers = await response1.json()
  const championshipDrivers = await response2.json()

  const combinedData = drivers.map(driver => {
      const championshipDriver = championshipDrivers.find(champDriver => champDriver.driver_number === driver.driver_number)
      return { ...driver, positionCurrent: championshipDriver.position_current, pointsCurrent: championshipDriver.points_current }
  })

  const sortedCombinedData = [...combinedData].sort(
      (a, b) => a.positionCurrent - b.positionCurrent
  ) 

  console.log(sortedCombinedData)

  const container = document.getElementById('drivers')

  sortedCombinedData.forEach(data => {
      const row = document.createElement('tr')
      row.className = 'border-b hover:bg-gray-100 transition'
      // row.style.backgroundColor = `#${data.team_colour}`

      const positionCurrentTd = document.createElement('td')
      positionCurrentTd.className = 'py-3 px-4'
      positionCurrentTd.textContent = `${data.positionCurrent} (${data.name_acronym})`
      positionCurrentTd.style.backgroundColor = '#0F172A'
      positionCurrentTd.style.color = `#${data.team_colour}`

      const imgTd = document.createElement('td')
      imgTd.className = 'py-3 px-4'
      const img = document.createElement('img');
      img.className = 'w-12 h-12 object-cover rounded-full min-w-[48px]';
      img.src = data.headshot_url
      imgTd.appendChild(img);
      imgTd.style.backgroundColor = '#0F172A'
      imgTd.style.color = `#${data.team_colour}`
      
      const nameTd = document.createElement('td')
      nameTd.className = 'py-3 px-4'
      nameTd.textContent = `${data.full_name} (#${data.driver_number})`
      // nameTd.style.backgroundColor = `#${data.team_colour}`
      nameTd.style.backgroundColor = '#0F172A'
      nameTd.style.color = `#${data.team_colour}`
      
      const pointsCurrentTd = document.createElement('td')
      pointsCurrentTd.className = 'py-3 px-4'
      pointsCurrentTd.textContent = data.pointsCurrent
      pointsCurrentTd.style.backgroundColor = '#0F172A'
      pointsCurrentTd.style.color = `#${data.team_colour}`
      
      const teamNameTd = document.createElement('td')
      teamNameTd.className = 'py-3 px-4 text-gray-600'
      teamNameTd.textContent = data.team_name
      teamNameTd.style.backgroundColor = '#0F172A'
      teamNameTd.style.color = `#${data.team_colour}`
      
      row.appendChild(positionCurrentTd)        
      row.appendChild(imgTd)
      row.appendChild(nameTd)
      row.appendChild(pointsCurrentTd)        
      row.appendChild(teamNameTd)

      container.appendChild(row)
  });

}

loadDrivers()


const VAPID_PUBLIC_KEY = 'BDuTDiucOQtb8mc7D_cJof6ZUjTEzF3pSCacfZZG1axbhvOXe5E8DJn0FAKFBSnLJQX6A8K_SjtFxnc-0rRw7kw'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

notify.addEventListener('click', async () => {  
  console.log(notify.checked)

  if(notify.checked == true) {

    if (!("Notification" in window)) {
      console.log("Notifications not supported");
    }

    else if (Notification.permission === "granted") {
      console.log("You will be receiving notifications");

      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered, scope:', reg.scope);
      } catch(e) {
        console.log('SW registration failed:', e.message);
      }
      
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      const response = await fetch('https://rohankajale--36fbdc14568e11f19f25ee650bb23af1.web.val.run', {
        method: 'POST',
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(subscription)
      })
    }

    else if (Notification.permission === "denied") {
      alert("Notifications are blocked. Enable them in browser settings.");
    }
    
    else {
        const permission = await Notification.requestPermission()
        
        if (permission === "granted") {
      
          const registration = await navigator.serviceWorker.ready;
          await navigator.serviceWorker.register('./sw.js');    
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          })

          console.log(subscription)

          const response = await fetch('https://rohankajale--36fbdc14568e11f19f25ee650bb23af1.web.val.run', {
            method: 'POST',
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify(subscription)
          })

        }

        else if (permission === "denied") {
          alert("Notifications are blocked. To receive notifications, enable them in browser settings.");
        }
    }
  }
})



