import { ProxmoxNode, VMPowerAction } from "../dist/index.js";

const proxmox = new ProxmoxNode({ host: "https://192.168.1.100",
    port: 8006,
    node: "homelab",
    tokenSecret: "b32289d4-6ff8-4cf7-9d73-3950360e6a2a",
    tokenID: "root@pam!coucou"
});

proxmox.VM(100).powerAction(VMPowerAction.STOP).then((status) => {
  console.log("VM Status:", status);
})

proxmox.remove(102).then((status) => {
  console.log("VM Removed:", status);
})

// proxmox.VM(100).powerAction(ProxmoxVMStatus.START).then((status) => {
//     console.log("VM Status:", status);
//   })
  