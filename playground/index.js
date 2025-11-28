import { ProxmoxNode } from "proxmox.ts";

const proxmox = new ProxmoxNode({ host: "https://192.168.1.100",
    port: 8006,
    node: "homelab",
    tokenSecret: "b32289d4-6ff8-4cf7-9d73-3950360e6a2a",
    tokenID: "root@pam!coucou"
});

proxmox.VM(100).getStatus().then((status) => {
  console.log("VM Status:", status);
})