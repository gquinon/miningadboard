# 📚 Instrucciones Git - Dashboard Minero EECOL

## ✅ Configuración Completada

```bash
Usuario: gnquinon
Email: gad.quinones@gmail.com
Rama: main
Commit inicial: 4dbef52
```

---

## 🚀 Cómo Hacer Commits (Para Kiro)

### 1. Ver cambios actuales
```bash
git status
```

### 2. Agregar archivos modificados
```bash
# Agregar todos los cambios
git add -A

# O agregar archivos específicos
git add "Dashboard Ejecutivo - Proyectos Mineros.html"
git add Panel-Admin-Nuevo.html
```

### 3. Hacer commit con mensaje descriptivo
```bash
git commit -m "✨ Descripción del cambio

- Detalle 1
- Detalle 2
- Detalle 3"
```

### 4. Ver historial de commits
```bash
git log --oneline
```

---

## 📝 Ejemplos de Commits

### Corrección de bugs
```bash
git add -A
git commit -m "🐛 Fix: Corregida búsqueda por texto en dashboard

- Agregado filtro de búsqueda en tiempo real
- Corregida función applyFilters()
- Mejorados logs de debugging"
```

### Nueva funcionalidad
```bash
git add -A
git commit -m "✨ Feature: Agregado sistema de exportación

- Exportación a Excel funcional
- Exportación a PDF
- Validación de datos antes de exportar"
```

### Mejoras de rendimiento
```bash
git add -A
git commit -m "⚡ Performance: Optimizado renderizado de proyectos

- Virtualización de lista con 200+ proyectos
- Lazy loading de imágenes
- Debounce en búsqueda"
```

### Documentación
```bash
git add -A
git commit -m "📚 Docs: Actualizada documentación del sistema

- Agregadas instrucciones de instalación
- Documentado sistema de filtros
- Agregados ejemplos de uso"
```

### Refactoring
```bash
git add -A
git commit -m "♻️ Refactor: Reorganizado código de filtros

- Separadas funciones de filtrado
- Mejorada legibilidad del código
- Eliminado código duplicado"
```

---

## 🌿 Conectar con GitHub (Cuando esté listo)

### 1. Crear repositorio en GitHub
- Ve a github.com
- Click en "New repository"
- Nombre: `dashboard-minero-eecol`
- No inicialices con README (ya tienes uno)

### 2. Conectar repositorio local con GitHub
```bash
git remote add origin https://github.com/gquinon/miningadboard.git
```
✅ **YA CONECTADO**

### 3. Subir código a GitHub
```bash
git push -u origin main
```

### 4. Futuros pushes
```bash
git push
```

---

## 🔄 Workflow Típico

```bash
# 1. Hacer cambios en los archivos
# 2. Ver qué cambió
git status

# 3. Agregar cambios
git add -A

# 4. Commit con mensaje descriptivo
git commit -m "✨ Descripción del cambio"

# 5. (Opcional) Subir a GitHub
git push
```

---

## 🎨 Emojis para Commits

- ✨ `:sparkles:` - Nueva funcionalidad
- 🐛 `:bug:` - Corrección de bug
- 📚 `:books:` - Documentación
- ⚡ `:zap:` - Mejora de rendimiento
- 🎨 `:art:` - Mejora de estructura/formato
- ♻️ `:recycle:` - Refactoring
- 🔧 `:wrench:` - Archivos de configuración
- 🚀 `:rocket:` - Deploy
- 🔒 `:lock:` - Seguridad
- 🌐 `:globe_with_meridians:` - Internacionalización
- ✅ `:white_check_mark:` - Tests
- 🔥 `:fire:` - Eliminar código/archivos

---

## 📊 Estado Actual del Proyecto

```
✅ Commit inicial realizado
✅ Git configurado con tu usuario
✅ 104 archivos en el repositorio
✅ Conectado con GitHub
✅ Código subido a: https://github.com/gquinon/miningadboard.git
✅ Listo para seguir trabajando en local

⏳ Pendiente: Configurar CI/CD
```

---

## 🆘 Comandos Útiles

### Ver diferencias
```bash
git diff
```

### Ver historial detallado
```bash
git log --graph --oneline --all
```

### Deshacer cambios no commiteados
```bash
git restore archivo.html
```

### Ver quién modificó cada línea
```bash
git blame archivo.html
```

### Crear una rama nueva
```bash
git checkout -b feature/nueva-funcionalidad
```

### Volver a main
```bash
git checkout main
```

---

## 📞 Contacto

**Usuario Git**: gnquinon  
**Email**: gad.quinones@gmail.com  
**Proyecto**: Dashboard Minero EECOL  
**Fecha Inicio**: $(date)

