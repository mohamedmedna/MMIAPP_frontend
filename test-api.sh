#!/bin/bash

echo "🔍 Test de l'API Backend"
echo "========================"
echo ""

# Test 1: Backend Health
echo "1️⃣ Test Backend Health..."
if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend est accessible"
else
    echo "   ❌ Backend n'est PAS accessible"
    echo "   💡 Démarrez le backend avec: cd server && npm run dev"
    exit 1
fi

# Test 2: Actualités
echo ""
echo "2️⃣ Test API Actualités..."
ACTUALITES_COUNT=$(curl -s http://localhost:4000/api/actualites | jq '. | length' 2>/dev/null || echo "0")
if [ "$ACTUALITES_COUNT" -gt 0 ]; then
    echo "   ✅ $ACTUALITES_COUNT actualités trouvées"
else
    echo "   ⚠️  Aucune actualité trouvée"
fi

# Test 3: Documents
echo ""
echo "3️⃣ Test API Documents..."
DOCUMENTS_COUNT=$(curl -s http://localhost:4000/api/documents | jq '. | length' 2>/dev/null || echo "0")
if [ "$DOCUMENTS_COUNT" -gt 0 ]; then
    echo "   ✅ $DOCUMENTS_COUNT documents trouvés"
else
    echo "   ⚠️  Aucun document trouvé"
fi

# Test 4: Frontend
echo ""
echo "4️⃣ Test Frontend React..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend est accessible"
else
    echo "   ❌ Frontend n'est PAS accessible"
    echo "   💡 Démarrez le frontend avec: npm start"
    exit 1
fi

echo ""
echo "========================"
echo "✅ Tous les tests sont OK !"
echo ""
echo "📱 Ouvrez votre navigateur sur:"
echo "   🌐 http://localhost:3000/"
echo ""
echo "🔧 Interface Admin:"
echo "   🌐 http://localhost:3000/admin-portail"
echo ""
