let { ipcRenderer } = require('electron')
const Swal = require('sweetalert2')

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

const closeBtn = document.querySelector('#closeBtn')
const reloadBtn = document.querySelector('#reloadBtn')
const menuBarang = document.querySelector('#menuBarang')
const tanggal = document.querySelector('#tanggal')


function generateTanggal() {
    let d = new Date()
    let daftarHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    let daftarBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

    let hari = daftarHari[d.getDay()]
    let tanggal = d.getDate()
    let bulan = daftarBulan[d.getMonth()]
    let tahun = d.getFullYear()

    let jam = d.getHours()
    let menit = d.getMinutes()
    let detik = d.getSeconds()

    if (jam.toString().length == 1) {
        jam = '0' + jam;
    }
    if (menit.toString().length == 1) {
        menit = '0' + menit;
    }
    if (detik.toString().length == 1) {
        detik = '0' + detik;
    }

    let hariTanggal = `${hari}, ${tanggal} ${bulan} ${tahun} ${jam}:${menit}:${detik}`
    return hariTanggal
}

setInterval(() => {
    tanggal.innerHTML = generateTanggal()
}, 1000)

closeBtn.addEventListener('click', () => {
    Swal.fire({
        text: "Ingin keluar?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Tidak',
        confirmButtonText: 'Ya!'
    }).then((result) => {
        if (result.isConfirmed) {
            ipcRenderer.send('close')
        }
    })
})

reloadBtn.addEventListener('click', () => {
    ipcRenderer.send('reload')
})

function formatangka(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

menuBarang.addEventListener('click', () => {
    console.log('ok')
})