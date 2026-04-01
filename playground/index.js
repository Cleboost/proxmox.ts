import { ProxmoxNode, VMPowerAction } from "../src/index";

const proxmox = new ProxmoxNode({
    host: process.env.URL,
    port: 8006,
    node: "gen8-01",
    tokenSecret: process.env.TOKEN_SECRET,
    tokenID: process.env.TOKEN_ID,
});

proxmox.version().then((version) => {
    console.log("Proxmox Version:", version);
});

// proxmox.clone(103, 121, {name: "samestunesasa"}).then(result => {})
// proxmox.VM(101).getStatus().then(result => {
//     console.log(result.lock);
// })

// proxmox.VM(100).powerAction(VMPowerAction.STOP).then((status) => {
//   console.log("VM Status:", status);
// })

// proxmox.remove(120).then((status) => {
//   console.log("VM Removed:", status);
// })

// proxmox.VM(100).powerAction(ProxmoxVMStatus.START).then((status) => {
//     console.log("VM Status:", status);
//   })
// proxmox.raw.$post("/qemu/100/status/start").then((status) => {
//     console.log(status);
// })

const since = Math.floor(Date.now() / 1000) - 86400;
proxmox.raw.$get(`/journal?since=${since}`).then((status) => {
    console.log("Journal (dernières 24h) :");
    console.log(status);
})