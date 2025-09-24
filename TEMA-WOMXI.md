# W-Protect - Tema Womxi 💜

## Colores del tema

Tu aplicación ahora tiene configurado el tema Womxi con los siguientes colores:

### Colores principales
- `--primary`: #d946a6 (Rosa Womxi)
- `--secondary`: #f3e8ff (Lavanda)
- `--background`: #fdf7f8 (Fondo claro)
- `--foreground`: Negro (Texto principal)

### Colores de emergencia
- `--womxi-emergency`: #ef4444 (Rojo emergencia)
- `--womxi-safe`: #10b981 (Verde seguro)
- `--womxi-warning`: #f59e0b (Amarillo advertencia)

## Cómo usar los estilos

### 1. Variables CSS en línea:
```tsx
<div style={{ 
  backgroundColor: 'var(--primary)', 
  color: 'var(--primary-foreground)' 
}}>
  Contenido
</div>
```

### 2. Clases CSS predefinidas:
```tsx
<IonButton className="womxi-emergency">
  Emergencia
</IonButton>

<IonCard className="womxi-safe">
  Estado seguro
</IonCard>
```

### 3. Propiedades de Ionic:
```tsx
<IonToolbar style={{ 
  '--background': 'var(--primary)', 
  '--color': 'var(--primary-foreground)' 
}}>
  <IonTitle>Título</IonTitle>
</IonToolbar>
```

## Tema oscuro

Para activar/desactivar el tema oscuro:

```tsx
// Activar tema oscuro
document.documentElement.classList.add('dark');

// Desactivar tema oscuro
document.documentElement.classList.remove('dark');

// Toggle
document.documentElement.classList.toggle('dark');
```

## Paleta de colores Womxi disponible

### Rosa Womxi
- `--womxi-pink-50` a `--womxi-pink-900`

### Púrpura Womxi
- `--womxi-purple-50` a `--womxi-purple-700`

### Azul Womxi
- `--womxi-blue-50` a `--womxi-blue-500`

## Ejemplo de uso completo

```tsx
import React from 'react';
import { IonCard, IonCardContent, IonButton } from '@ionic/react';

const MiComponente = () => (
  <IonCard style={{ 
    '--background': 'var(--card)', 
    '--color': 'var(--card-foreground)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)'
  }}>
    <IonCardContent>
      <h2 style={{ color: 'var(--primary)' }}>
        Título Womxi
      </h2>
      <p style={{ color: 'var(--muted-foreground)' }}>
        Contenido del card
      </p>
      <IonButton className="womxi-emergency">
        Botón de emergencia
      </IonButton>
    </IonCardContent>
  </IonCard>
);
```

¡Ahora tu aplicación W-Protect tiene el tema Womxi funcionando perfectamente! 🚀