# proxmox.ts

**proxmox.ts** est une bibliothèque TypeScript moderne pour interagir facilement avec l'API Proxmox VE (machines virtuelles, conteneurs, stockage, etc.) avec typage complet et helpers haut niveau.

> [!WARNING] 
> **Note**: La bibliothèque est conçue pour être utilisée avec Proxmox VE 6.0 et supérieur. Certaines fonctionnalités peuvent ne pas être disponibles sur les versions antérieures.

## Fonctionnalités principales

-  Connexion simple via token API (recommandé)
-  Gestion des machines virtuelles (VM) : lecture, modification, actions (start/stop/reset...), interfaces réseau, disques, etc.
-  Typage TypeScript strict sur toutes les entités
-  Helpers pour manipuler la configuration (réseaux, disques, RAM, boot, etc.)
-  Cache automatique de la configuration VM
-  Support des actions asynchrones et du rafraîchissement automatique

## Installation

```bash
npm install proxmox.ts
```

## Exemple d'utilisation

```typescript
import { ProxmoxNode } from 'proxmox.ts';

const node = new ProxmoxNode({
  host: 'https://proxmox.example.com',
  port: 8006,
  node: 'mynode',
  tokenID: 'root@pam!apitoken',
  tokenSecret: 'votre_token_secret',
});

async function main() {
  const vm = node.VM(100);
  const config = await vm.getConfig();
  console.log('Config VM:', config);
  await vm.powerAction('start');
  await vm.addInterface({ bridge: 'vmbr0', model: 'virtio' });
  // ...
}

main();
```

## Documentation

-  Voir le dossier [`/docs`](./docs) pour l’API complète et des exemples avancés.
-  Les types sont disponibles dans [`src/types`](./src/types).

## Contribution

Les contributions sont bienvenues ! Merci d’ouvrir une issue ou une pull request.

## Licence

MIT
