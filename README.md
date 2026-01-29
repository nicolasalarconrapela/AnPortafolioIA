This example shows how to load [Avaturn](https://avaturn.me) avatars using three.js.

![Avaturn Three.js example](https://assets.avaturn.me/docs/three-js-example.jpg)

# Build

There is nothing to build, just run a http server in this folder. You can install one with e.g.:

```bash
npm install -g local-web-server

```

And then run

```bash
ws

```

The server will open up at `http://localhost:8000`

Read more at [docs.avaturn.me](https://docs.avaturn.me).

## Developer

### Inspect

```bash
npm i -g @gltf-transform/cli
gltf-transform inspect public/model.glb
```

### Reducer

```bash
npm i -D @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions @gltf-transform/cli
# Probar
npx gltf-transform --help
```

Ahora instalar [KTX-Software](https://github.com/KhronosGroup/KTX-Software) y ejecutar :

```bash
./scripts/optimize-avatar.sh
```

[Pendiente de implementar](https://chatgpt.com/c/697b49ec-f0c8-8330-ac0d-a27323647eda)
