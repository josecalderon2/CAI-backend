# Color Scheme for EcoPoints Mobile App

Este documento define el esquema de colores oficial para la aplicación móvil EcoPoints.

## Colores Principales

### Primary Blue (Azul Primario)
- **RGB**: `rgb(31, 119, 184)`
- **Hex**: `#1F77B8`
- **SwiftUI**: `Color(red: 31/255, green: 119/255, blue: 184/255)`

### Accent Orange (Naranja Acento)
- **RGB**: `rgb(255, 149, 0)`
- **Hex**: `#FF9500`
- **SwiftUI**: `Color(red: 255/255, green: 149/255, blue: 0/255)`

### Success Green (Verde Éxito)
- **RGB**: `rgb(16, 185, 129)`
- **Hex**: `#10B981`
- **SwiftUI**: `Color(red: 16/255, green: 185/255, blue: 129/255)`

### Error Red (Rojo Error)
- **RGB**: `rgb(239, 68, 68)`
- **Hex**: `#EF4444`
- **SwiftUI**: `Color(red: 239/255, green: 68/255, blue: 68/255)`

## Uso en SwiftUI (WelcomeView.swift)

Reemplazar las definiciones de colores actuales con:

```swift
// MARK: - Colors

private extension Color {
    // Colores principales de EcoPoints
    static let primaryBlue = Color(red: 31/255, green: 119/255, blue: 184/255)
    static let accentOrange = Color(red: 255/255, green: 149/255, blue: 0/255)
    static let successGreen = Color(red: 16/255, green: 185/255, blue: 129/255)
    static let errorRed = Color(red: 239/255, green: 68/255, blue: 68/255)
    
    // Mantener compatibilidad con código existente
    // Reemplazar green400, green600, green700 según sea necesario:
    static let green400 = successGreen.opacity(0.7)
    static let green600 = successGreen
    static let green700 = successGreen.opacity(1.2)
}
```

## Actualización de Componentes

### Botones
- **Botón Primario**: Usar `primaryBlue` para el fondo
- **Botón Secundario**: Usar `primaryBlue` para el borde y texto
- **Botón de Acción**: Usar `accentOrange` para énfasis

### Estados
- **Éxito**: Usar `successGreen` para mensajes positivos
- **Error**: Usar `errorRed` para mensajes de error
- **Información**: Usar `primaryBlue` para información neutral

### Pills/Badges
- **Eco-Friendly**: Usar `successGreen`
- **Recompensas**: Usar `accentOrange`
- **Ranking**: Usar `primaryBlue`

## API Endpoint

El backend expone estos colores a través del siguiente endpoint:

```
GET /theme/colors
```

**Respuesta:**
```json
{
  "primaryBlue": {
    "red": 31,
    "green": 119,
    "blue": 184,
    "hex": "#1F77B8",
    "rgb": "rgb(31, 119, 184)"
  },
  "accentOrange": {
    "red": 255,
    "green": 149,
    "blue": 0,
    "hex": "#FF9500",
    "rgb": "rgb(255, 149, 0)"
  },
  "successGreen": {
    "red": 16,
    "green": 185,
    "blue": 129,
    "hex": "#10B981",
    "rgb": "rgb(16, 185, 129)"
  },
  "errorRed": {
    "red": 239,
    "green": 68,
    "blue": 68,
    "hex": "#EF4444",
    "rgb": "rgb(239, 68, 68)"
  }
}
```

## Migración desde Colores Anteriores

Si estás migrando desde el esquema de colores verde anterior:

| Color Anterior | Nuevo Color | Uso Recomendado |
|----------------|-------------|-----------------|
| `green400` | `successGreen` con opacity | Estados secundarios |
| `green600` | `successGreen` | Principal para éxito |
| `green700` | `successGreen` oscurecido | Hover/Active states |
| - | `primaryBlue` | Navegación y acciones primarias |
| - | `accentOrange` | Llamadas a la acción importantes |
| - | `errorRed` | Errores y alertas |

## Notas Importantes

1. Estos colores están diseñados para cumplir con las guías de accesibilidad WCAG 2.1
2. El contraste entre texto blanco y estos colores es adecuado para lectibilidad
3. Para fondos claros, usar las versiones completas de los colores
4. Para fondos oscuros, considerar ajustar la opacity según sea necesario
