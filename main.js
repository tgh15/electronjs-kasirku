const { app, BrowserWindow, ipcMain } = require('electron')
const { PosPrinter } = require("electron-pos-printer");
const path = require('path')

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'kasirku'
    }
});

const { attachPaginate } = require('knex-paginate');
attachPaginate();

let win

function createWindow() {
    win = new BrowserWindow({
        // width: 800,
        // height: 600,
        frame: false,
        fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // win.loadFile('index.html')
    win.loadURL(`file://${__dirname}/page/transaksi.html`)
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

})

ipcMain.on('close', () => {
    app.quit()
})
ipcMain.on('reload', (e) => {
    win.reload()

})

ipcMain.on('barang:semua', (e) => {
    knex.select().table('barang').then(result => {
        e.returnValue = result
    })
})

ipcMain.on('barang:submit', (e, arg) => {
    // console.log(arg)
    knex('barang').insert(arg).then(function (result) {
        knex('barang').where('id', result[0]).then(res => {
            e.returnValue = res
        })
    }).catch(err => console.log(err))
})

ipcMain.on('barang:hapus', (e, arg) => {
    // console.log(arg)
    knex('barang').where('id', arg).del().then((result) => {
        e.returnValue = result
    })
})

ipcMain.on('barcode', (e, arg) => {
    // console.log(arg)
    knex('barang').where('kode_barang', arg).then(res => {
        e.reply('barang', res[0])
    }).catch(err => console.log(err))
})

ipcMain.on('carinama', (e, arg) => {
    // console.log(arg)
    knex('barang').where('nama_barang', 'like', '%' + arg + '%')
        .then(res => e.reply('hasilcari', res))
        .catch(err => console.log(err))
})

ipcMain.on('print', (e, arg) => {
    let belanja = []
    arg.invoice = `SU` + Math.floor(Math.random() * (999999 - 100000)) + 100000 + new Date().getFullYear()
    arg.belanjaan.map(d => {
        belanja.push([`${d.nama_barang}<br> ${d.harga}`, `X ${d.qty}`, `Rp. ${d.subtotal}`])
    })

    const data = [
        {
            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
            value: 'TOKO SINAR UTAMA',
            style: `text-align:center;`,
            css: { "font-weight": "700", "font-size": "18px" }
        },
        {
            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
            value: 'Jl. Poros Kariango',
            style: `text-align:center;`,
            css: { "font-weight": "700", "font-size": "14px" }
        },
        {
            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
            value: 'Hp. 08232323232 <br><hr>',
            style: `text-align:center;`,
            css: { "font-weight": "700", "font-size": "12px" }
        },
        {
            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
            value: 'Tanggal : ' + arg.tanggal,
            css: { "font-weight": "700", "font-size": "12px" }
        },
        {
            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
            value: 'Invoice : ' + arg.invoice,
            css: { "font-weight": "700", "font-size": "12px" }
        },
        {
            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
            value: 'Pelanggan : ' + arg.pelanggan,
            css: { "font-weight": "700", "font-size": "12px" }
        },
        {
            type: 'table',
            style: 'border: 1px solid #ff0000',
            tableBody: belanja,
            tableBodyStyle: 'border: 0.5px solid #ddd; font-weight:700; font-size:12px'
        },
        {
            type: 'table',
            // style: 'border: 1px solid #ff0000',s
            css: {
                "font-size": "12px",
                "font-family": "sans-serif",
            },
            tableBody: [
                ['Total Belanja ', `Rp. ${arg.harga_total}`],
                ['Bayar ', `Rp. ${arg.bayar}`],
                ['Kembalian ', `Rp. ${arg.kembalian}`]
            ],
            tableBodyStyle: 'border: 0.5px solid #ddd; font-weight:700; font-size:12px',
        },
        {
            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
            value: `Terima kasih atas kunjungan anda<br>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan`,
            style: `text-align:center;`,
            css: { "font-weight": "700", "font-size": "12px", "margin-top": "20px" }
        },
    ]

    const options = {
        preview: false,               // Preview in window or print
        width: '240px',               //  width of content body
        margin: '1 1 1 1',            // margin of content body
        copies: 1,                    // Number of copies to print
        printerName: 'EPSON TM-U220 Receipt',        // printerName: string, check with webContent.getPrinters()
        silent: true,
    }

    console.log(parseInt(arg.harga_total.replace(/,/g, '')))

    knex('transaksi').insert({
        belanjaan: JSON.stringify(arg.belanjaan),
        invoice: arg.invoice,
        harga_total: parseInt(arg.harga_total.replace(/,/g, '')),
        bayar: parseInt(arg.bayar.replace(/,/g, '')),
        kembalian: parseInt(arg.kembalian.replace(/,/g, ''))
    }).then(function (result) {
        e.returnValue = true
    }).catch(err => console.log(err))

    // PosPrinter.print(data, options)
    //     .then(() => {
    //     })
    //     .catch((error) => {
    //         console.log(error)
    //     });
})

ipcMain.on('transaksi:semua', (e, arg) => {
    return knex("transaksi").paginate({
        perPage: 10,
        currentPage: arg.currentPage
    }).then(result => {
        e.returnValue = result
    })
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

