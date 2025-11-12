# 🔒 Seguridad del Proyecto

## Firebase API Keys

Las API Keys de Firebase en `config.js` son **públicas por diseño** en aplicaciones web. Esto es normal y esperado.

### ¿Por qué es seguro?

1. **Las API Keys de Firebase no son secretas**: Están diseñadas para ser incluidas en aplicaciones cliente
2. **La seguridad se maneja con Reglas de Firestore**: No con la API Key
3. **Restricciones de dominio**: Solo dominios autorizados pueden usar la API

### Configuración de Seguridad

#### Reglas de Firestore Configuradas:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /proyectos/{projectId} {
      allow read: if true;  // Lectura pública
      allow write: if true; // Escritura controlada (mejorar con auth)
    }
  }
}
```

#### Dominios Autorizados:
- ✅ `localhost` (desarrollo)
- ✅ `miningadboard.netlify.app` (producción)

### Mejoras de Seguridad Futuras

1. **Implementar Firebase Authentication**
   - Requerir login para escritura
   - Roles y permisos granulares

2. **Reglas de Firestore más estrictas**
   ```javascript
   allow write: if request.auth != null && 
                   request.auth.token.role == 'admin';
   ```

3. **Rate Limiting**
   - Implementar límites de requests
   - Prevenir abuso de la API

4. **Monitoreo**
   - Alertas de uso anormal
   - Logs de acceso

### Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:
1. **NO** la publiques en issues públicos
2. Contacta directamente a: gad.quinones@gmail.com
3. Proporciona detalles y pasos para reproducir

### Referencias

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase API Keys Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Netlify Security](https://docs.netlify.com/security/secure-access-to-sites/)

---

**Última actualización**: 2024
**Proyecto**: Mining Dashboard EECOL
**Mantenedor**: @gquinon
