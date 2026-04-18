
## Zustand Paketi Ekleme Planı

Proje zaten `src/store/synapseStore.ts` dosyasında Zustand kullanıyor ama paket kurulu değil, bu yüzden TypeScript hatası veriyor. Bun lockfile'ı olduğuna göre projede **Bun** paket yöneticisi kullanılıyor.

### Yapılacak İşlemler:

1. **Zustand paketini kur** - `bun add zustand` komutunu çalışturarak paketi dependencies'e ekle
2. **package.json'ı otomatik güncelle** - Bun otomatik olarak package.json'ı güncelleyecek
3. **Lockfile'ı güncelle** - `bun.lock` ve `bun.lockb` dosyaları otomatik güncellenecek

### Komut:
```bash
bun add zustand
```

Bu komut:
- `zustand` paketini `dependencies` bölümüne ekleyecek
- `bun.lock` ve `bun.lockb` dosyalarını otomatik güncelleyecek
- Gerekli tüm bağımlılıkları indirecek

### Beklenen package.json değişikliği:
```json
"dependencies": {
  // ... existing packages
  "zustand": "^5.x.x"
}
```

### Onay ve İlerleme
Plan onaylandığında Zustand paketini kurup tüm ilgili dosyaları güncelleyeceğim.
