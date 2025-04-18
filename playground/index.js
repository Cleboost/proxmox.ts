import { ProxmoxNode } from "../dist/index.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const proxmox = new ProxmoxNode({ host: "https://100.64.0.3", port: 8006, node: "athena", tokenSecret: "e44720b0-da41-4589-8fca-640ec0eaf3df", tokenID: "root@pam!test" });

proxmox.VM(100).getConfig().then((config) => {
  console.log("VM Config:", config.disks[0].size);
})