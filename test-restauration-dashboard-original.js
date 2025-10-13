// Script de test pour vérifier la restauration de l'ancien dashboard Secrétariat Général
// À exécuter dans la console du navigateur sur la page du dashboard

console.log('🧪 Test de restauration de l\'ancien dashboard Secrétariat Général...');

// Test 1: Vérification de la page actuelle
console.log('\n📋 Test 1: Vérification de la page actuelle');
console.log('URL actuelle:', window.location.href);
console.log('Page du dashboard Secrétariat Général:', window.location.pathname.includes('secretaire-general'));

// Test 2: Vérification de la structure originale restaurée
console.log('\n🔍 Test 2: Vérification de la structure originale restaurée');
console.log('Structure attendue (ancienne version):');
console.log('- Header simple avec gradient vert-jaune');
console.log('- Navigation par onglets (pas de sidebar)');
console.log('- Contenu principal centré');
console.log('- Footer simple avec gradient vert-jaune');

const dashboardContainer = document.querySelector('div[style*="min-height: 100vh"]');
const dashboardHeader = document.querySelector('div[style*="linear-gradient(90deg, #28a745 0%, #ffc107 100%)"]');
const tabButtons = document.querySelectorAll('button[style*="background: #28a745"]');
const dashboardFooter = document.querySelector('div[style*="linear-gradient(90deg, #28a745 0%, #ffc107 100%)"]:last-child');

if (dashboardContainer) {
  console.log('✅ Container principal présent (ancienne structure)');
} else {
  console.log('❌ Container principal manquant');
}

if (dashboardHeader) {
  console.log('✅ Header présent (gradient vert-jaune)');
} else {
  console.log('❌ Header manquant');
}

if (tabButtons.length > 0) {
  console.log('✅ Boutons de navigation par onglets présents:', tabButtons.length);
} else {
  console.log('❌ Boutons de navigation par onglets manquants');
}

if (dashboardFooter) {
  console.log('✅ Footer présent (gradient vert-jaune)');
} else {
  console.log('❌ Footer manquant');
}

// Test 3: Vérification de l'absence de la nouvelle structure
console.log('\n🔍 Test 3: Vérification de l\'absence de la nouvelle structure');
const newSidebar = document.querySelector('.secretaire-general-sidebar');
const newLayout = document.querySelector('.dashboard-layout');
const newMain = document.querySelector('.dashboard-main');

if (!newSidebar) {
  console.log('✅ Nouvelle sidebar supprimée (bon)');
} else {
  console.log('❌ Nouvelle sidebar encore présente');
}

if (!newLayout) {
  console.log('✅ Nouveau layout supprimé (bon)');
} else {
  console.log('❌ Nouveau layout encore présent');
}

if (!newMain) {
  console.log('✅ Nouvelle main section supprimée (bon)');
} else {
  console.log('❌ Nouvelle main section encore présente');
}

// Test 4: Vérification du header restauré
console.log('\n🔍 Test 4: Vérification du header restauré');
if (dashboardHeader) {
  const headerTitle = dashboardHeader.querySelector('h2');
  const headerActions = dashboardHeader.querySelector('div[style*="display: flex"]');
  
  if (headerTitle) {
    console.log('✅ Titre du header présent:', headerTitle.textContent);
    
    if (headerTitle.textContent.includes('Secrétariat Général')) {
      console.log('✅ Titre correct: "Secrétariat Général - Gestion des Autorisations"');
    } else {
      console.log('❌ Titre incorrect:', headerTitle.textContent);
    }
  }
  
  if (headerActions) {
    const refreshButton = headerActions.querySelector('button[style*="background: #007bff"]');
    const logoutButton = headerActions.querySelector('button[style*="danger"]');
    
    if (refreshButton) {
      console.log('✅ Bouton "Actualiser" présent');
    } else {
      console.log('❌ Bouton "Actualiser" manquant');
    }
    
    if (logoutButton) {
      console.log('✅ Bouton "Déconnexion" présent');
    } else {
      console.log('❌ Bouton "Déconnexion" manquant');
    }
  }
  
  // Vérification du gradient vert-jaune
  const headerStyle = window.getComputedStyle(dashboardHeader);
  console.log('Background du header:', headerStyle.background);
  
  if (headerStyle.background.includes('linear-gradient') && 
      (headerStyle.background.includes('28a745') || headerStyle.background.includes('ffc107'))) {
    console.log('✅ Header a le gradient vert-jaune original');
  } else {
    console.log('❌ Header n\'a pas le gradient vert-jaune original');
  }
} else {
  console.log('❌ Header manquant pour les tests');
}

// Test 5: Vérification de la navigation par onglets
console.log('\n🔍 Test 5: Vérification de la navigation par onglets');
if (tabButtons.length >= 4) {
  console.log('✅ Au moins 4 onglets présents');
  
  const expectedTabs = ['Tableau de bord', 'Mes demandes', 'Historique', 'Notifications'];
  tabButtons.forEach((button, index) => {
    const buttonText = button.textContent.trim();
    if (expectedTabs[index]) {
      console.log(`✅ Onglet ${index + 1}: "${buttonText}" (attendu: "${expectedTabs[index]}")`);
    }
  });
  
  // Vérification de l'onglet actif
  const activeTab = Array.from(tabButtons).find(btn => 
    btn.style.background && btn.style.background.includes('28a745')
  );
  
  if (activeTab) {
    console.log('✅ Onglet actif détecté:', activeTab.textContent.trim());
  } else {
    console.log('❌ Aucun onglet actif détecté');
  }
} else {
  console.log('❌ Pas assez d\'onglets présents');
}

// Test 6: Vérification du contenu principal
console.log('\n🔍 Test 6: Vérification du contenu principal');
const dashboardContent = document.querySelector('div[style*="padding: 24px"]');

if (dashboardContent) {
  console.log('✅ Contenu principal présent');
  
  // Vérification de la largeur maximale
  const contentStyle = window.getComputedStyle(dashboardContent);
  if (contentStyle.maxWidth === '1400px') {
    console.log('✅ Largeur maximale correcte (1400px)');
  } else {
    console.log('❌ Largeur maximale incorrecte:', contentStyle.maxWidth);
  }
  
  // Vérification du centrage
  if (contentStyle.margin === '0px auto') {
    console.log('✅ Contenu centré');
  } else {
    console.log('❌ Contenu non centré:', contentStyle.margin);
  }
} else {
  console.log('❌ Contenu principal manquant');
}

// Test 7: Vérification du footer restauré
console.log('\n🔍 Test 7: Vérification du footer restauré');
if (dashboardFooter) {
  const footerText = dashboardFooter.querySelector('span');
  
  if (footerText) {
    console.log('✅ Texte du footer présent:', footerText.textContent);
    
    if (footerText.textContent.includes('Ministère des Mines et de l\'Industrie')) {
      console.log('✅ Copyright correct présent');
    } else {
      console.log('❌ Copyright incorrect ou manquant');
    }
  }
  
  // Vérification du gradient vert-jaune
  const footerStyle = window.getComputedStyle(dashboardFooter);
  console.log('Background du footer:', footerStyle.background);
  
  if (footerStyle.background.includes('linear-gradient') && 
      (footerStyle.background.includes('28a745') || footerStyle.background.includes('ffc107'))) {
    console.log('✅ Footer a le gradient vert-jaune original');
  } else {
    console.log('❌ Footer n\'a pas le gradient vert-jaune original');
  }
  
  // Vérification du centrage
  if (footerStyle.textAlign === 'center') {
    console.log('✅ Footer centré');
  } else {
    console.log('❌ Footer non centré:', footerStyle.textAlign);
  }
} else {
  console.log('❌ Footer manquant pour les tests');
}

// Test 8: Vérification de l'absence des classes CSS de la nouvelle structure
console.log('\n🔍 Test 8: Vérification de l\'absence des classes CSS de la nouvelle structure');
const newClasses = [
  '.dashboard-layout',
  '.dashboard-header',
  '.dashboard-container',
  '.dashboard-main',
  '.dashboard-footer',
  '.secretaire-general-sidebar',
  '.header-left',
  '.header-center',
  '.header-right'
];

newClasses.forEach(className => {
  const element = document.querySelector(className);
  if (!element) {
    console.log(`✅ Classe ${className} supprimée (bon)`);
  } else {
    console.log(`❌ Classe ${className} encore présente`);
  }
});

// Test 9: Vérification de la structure générale
console.log('\n🔍 Test 9: Vérification de la structure générale');
const body = document.body;
const bodyChildren = body.children;

console.log('Nombre d\'éléments enfants du body:', bodyChildren.length);

if (bodyChildren.length <= 3) {
  console.log('✅ Structure simple (header, content, footer)');
} else {
  console.log('❌ Structure complexe avec trop d\'éléments');
}

// Test 10: Instructions de vérification visuelle finale
console.log('\n📝 Test 10: Instructions de vérification visuelle finale');
console.log('Vérifiez visuellement que:');
console.log('1. ✅ Header: Gradient vert-jaune simple, titre + boutons');
console.log('2. ✅ Navigation: Onglets horizontaux (pas de sidebar)');
console.log('3. ✅ Contenu: Centré avec largeur maximale 1400px');
console.log('4. ✅ Footer: Gradient vert-jaune simple, copyright centré');
console.log('5. ✅ Structure: Simple et claire, sans sidebar complexe');

console.log('\n✅ Tests de restauration terminés !');
console.log('🔍 Vérifiez visuellement que la structure correspond à l\'ancienne version');
console.log('📖 Structure attendue: Header simple, Onglets, Contenu centré, Footer simple');
console.log('❌ Structure NON attendue: Header complexe, Sidebar, Layout flexbox complexe');





