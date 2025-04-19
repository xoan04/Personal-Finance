# 💰 Mi Presupuesto Personal

Una aplicación web completa para gestionar tus finanzas personales, siguiendo la regla 50/30/20 para una administración financiera saludable. Esta herramienta te permite realizar un seguimiento de tus ingresos, gastos y metas financieras con una interfaz intuitiva y visual.

![Banner de Mi Presupuesto Personal](https://via.placeholder.com/800x400?text=Mi+Presupuesto+Personal)

## 📋 Características

- **Dashboard completo**: Visualiza tu situación financiera de un vistazo
- **Gestión de gastos e ingresos**: Registra y categoriza todas tus transacciones
- **Regla 50/30/20**: Distribución automática de tus finanzas (50% necesidades, 30% deseos, 20% ahorros)
- **Metas financieras**: Establece objetivos de ahorro y haz seguimiento de tu progreso
- **Gráficos interactivos**: Visualiza tus gastos por categoría y evolución mensual
- **Autenticación de usuarios**: Registro e inicio de sesión con correo electrónico
- **Almacenamiento en la nube**: Sincronización de datos con Firebase Firestore
- **Soporte para múltiples monedas**: Personaliza la moneda según tu país
- **Diseño responsivo**: Funciona perfectamente en dispositivos móviles y de escritorio

## 🚀 Tecnologías utilizadas

- [Next.js](https://nextjs.org/) - Framework de React
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Recharts](https://recharts.org/) - Biblioteca de gráficos
- [Firebase](https://firebase.google.com/) - Autenticación y base de datos
- [date-fns](https://date-fns.org/) - Utilidades para fechas

## 💻 Instalación

1. Clona este repositorio:
\`\`\`bash
git clone https://github.com/tu-usuario/mi-presupuesto-personal.git
cd mi-presupuesto-personal
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
# o
yarn install
# o
pnpm install
\`\`\`

3. Configura las variables de entorno:
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu-measurement-id
\`\`\`

4. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
# o
yarn dev
# o
pnpm dev
\`\`\`

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 🔥 Configuración de Firebase

### Crear un proyecto en Firebase

1. Ve a la [consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto
2. Habilita la autenticación con correo electrónico y contraseña
3. Crea una base de datos Firestore

### Configurar las reglas de seguridad de Firestore

En la sección "Firestore Database" > "Reglas", configura las siguientes reglas:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /incomes/{incomeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /goals/{goalId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
\`\`\`

## 📱 Uso de la aplicación

### Registro e inicio de sesión

1. Accede a la página de registro y crea una cuenta con tu correo electrónico
2. Inicia sesión con tus credenciales

### Gestión de finanzas

1. **Añadir ingresos**: Registra tus fuentes de ingresos con categorías
2. **Añadir gastos**: Registra tus gastos diarios con categorías
3. **Establecer metas**: Crea objetivos financieros con fechas límite
4. **Visualizar estadísticas**: Analiza tus patrones de gasto en la pestaña "Resumen"
5. **Revisar presupuesto**: Verifica tu distribución según la regla 50/30/20

## 📁 Estructura del proyecto

\`\`\`
mi-presupuesto-personal/
├── app/                    # Rutas y páginas de Next.js
│   ├── login/              # Página de inicio de sesión
│   ├── register/           # Página de registro
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página principal
├── components/             # Componentes reutilizables
│   ├── ui/                 # Componentes de UI (shadcn)
│   ├── budget-overview.tsx # Componente de presupuesto
│   ├── expense-chart.tsx   # Gráficos de gastos
│   └── ...                 # Otros componentes
├── context/                # Contextos de React
│   ├── auth-context.tsx    # Contexto de autenticación
│   └── finance-context.tsx # Contexto de finanzas
├── lib/                    # Utilidades y configuraciones
│   ├── firebase.ts         # Configuración de Firebase
│   ├── types.ts            # Tipos de TypeScript
│   └── utils.ts            # Funciones de utilidad
├── public/                 # Archivos estáticos
└── ...                     # Archivos de configuración
\`\`\`

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

## 📞 Contacto +573245135343

Juan Gómez - ju4ng0mezs@gmail.com


---

⭐️ ¡Si te gusta este proyecto, no olvides darle una estrella! ⭐️
