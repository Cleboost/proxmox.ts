# Démarrage rapide avec proxmox.ts

Ce guide vous montre comment installer la bibliothèque, se connecter à un serveur Proxmox VE et effectuer vos premières opérations sur une VM.

## Installation

```bash
npm install proxmox.ts
```

## Connexion à Proxmox VE

```typescript
import { ProxmoxNode } from 'proxmox.ts';

const node = new ProxmoxNode({
  host: 'https://proxmox.example.com',
  port: 8006,
  node: 'mynode',
  tokenID: 'root@pam!apitoken',
  tokenSecret: 'votre_token_secret',
});
```

> [!TIP]
> Le port n'est pas nécessaire si vous utilisez le port par défaut (8006).

## Lire la configuration d'une VM

```typescript
const vm = node.VM(100);
const config = await vm.getConfig();
console.log(config);
```

## Démarrer une VM

```typescript
await vm.powerAction('start');
```

> [!NOTE]
> Il n'y a actuellement aucun retour d'erreur si la VM est déjà en cours d'exécution ou si l'action échoue.
> Vous pouvez vérifier l'état de la VM avec `await vm.getStatus()`.
> Cela sera implementé dans une version future ;)

## Ajouter une interface réseau

```typescript
await vm.addInterface({ bridge: 'vmbr0', model: 'virtio' });
```

Pour plus d’exemples, consultez les autres pages de la documentation.
