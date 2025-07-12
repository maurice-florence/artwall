# src/components/AdminModal/install.sh
# filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\install.sh
#!/bin/bash

echo "🔄 Migrating AdminModal to new structure..."

# Create new directory structure
mkdir -p src/components/AdminModal/{components,hooks,styles,types,utils}

# Create index file
cat > src/components/AdminModal/index.tsx << 'EOF'
export { default } from './AdminModal';
EOF

echo "✅ AdminModal structure created!"
echo "📋 Next steps:"
echo "1. Move existing AdminModal.tsx content to new structure"
echo "2. Update imports in parent components"
echo "3. Run tests to verify functionality"
echo "4. Remove old AdminModal.tsx file"