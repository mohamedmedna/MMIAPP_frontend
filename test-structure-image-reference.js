// Script de test pour vérifier que la structure correspond exactement à l'image de référence
// À exécuter dans la console du navigateur sur la page du dashboard

console.log('🧪 Test de la structure selon l\'image de référence...');

// Test 1: Vérification de la page actuelle
console.log('\n📋 Test 1: Vérification de la page actuelle');
console.log('URL actuelle:', window.location.href);
console.log('Page du dashboard Secrétariat Général:', window.location.pathname.includes('secretaire-general'));

// Test 2: Vérification de la structure principale selon l'image
console.log('\n🔍 Test 2: Vérification de la structure selon l\'image de référence');
console.log('Structure attendue selon l\'image:');
console.log('- Header (haut) - pleine largeur avec gradient vert-jaune');
console.log('- Left Panel/Sidebar (gauche) - panel vertical blanc');
console.log('- Main Section (droite) - section principale large');
console.log('- Footer (bas) - pleine largeur avec gradient vert-jaune');

const dashboardLayout = document.querySelector('.dashboard-layout');
const dashboardHeader = document.querySelector('.dashboard-header');
const sidebar = document.querySelector('.secretaire-general-sidebar');
const dashboardMain = document.querySelector('.dashboard-main');
const dashboardFooter = document.querySelector('.dashboard-footer');

if (dashboardLayout) {
  console.log('✅ Layout principal présent (.dashboard-layout)');
} else {
  console.log('❌ Layout principal manquant');
}

if (dashboardHeader) {
  console.log('✅ Header présent (.dashboard-header)');
} else {
  console.log('❌ Header manquant');
}

if (sidebar) {
  console.log('✅ Sidebar/Left Panel présent (.secretaire-general-sidebar)');
} else {
  console.log('❌ Sidebar/Left Panel manquant');
}

if (dashboardMain) {
  console.log('✅ Main Section présente (.dashboard-main)');
} else {
  console.log('❌ Main Section manquante');
}

if (dashboardFooter) {
  console.log('✅ Footer présent (.dashboard-footer)');
} else {
  console.log('❌ Footer manquant');
}

// Test 3: Vérification du header selon l'image
console.log('\n🔍 Test 3: Vérification du header selon l\'image');
if (dashboardHeader) {
  const headerLeft = dashboardHeader.querySelector('.header-left');
  const headerCenter = dashboardHeader.querySelector('.header-center');
  const headerRight = dashboardHeader.querySelector('.header-right');
  
  if (headerLeft) {
    console.log('✅ Section gauche du header présente');
    const orgTitle = headerLeft.querySelector('.header-organization');
    if (orgTitle) {
      console.log('✅ "Secrétariat Général" présent à gauche:', orgTitle.textContent);
    }
  }
  
  if (headerCenter) {
    console.log('✅ Section centre du header présente');
    const mainTitle = headerCenter.querySelector('.header-title');
    if (mainTitle) {
      console.log('✅ Titre principal au centre:', mainTitle.textContent);
    }
  }
  
  if (headerRight) {
    console.log('✅ Section droite du header présente');
    const refreshBtn = headerRight.querySelector('.refresh-button');
    const subtitle = headerRight.querySelector('.header-subtitle');
    
    if (refreshBtn) {
      console.log('✅ Bouton "Actualiser" présent à droite');
    }
    
    if (subtitle) {
      console.log('✅ "Gestion des autorisations" présent:', subtitle.textContent);
    }
  }
  
  // Vérification du gradient vert-jaune
  const headerStyle = window.getComputedStyle(dashboardHeader);
  console.log('Background du header:', headerStyle.background);
  
  if (headerStyle.background.includes('linear-gradient') && 
      (headerStyle.background.includes('229954') || headerStyle.background.includes('f4d03f'))) {
    console.log('✅ Header a un gradient vert-jaune');
  } else {
    console.log('❌ Header n\'a pas le gradient vert-jaune attendu');
  }
} else {
  console.log('❌ Header manquant pour les tests');
}

// Test 4: Vérification de la sidebar selon l'image
console.log('\n🔍 Test 4: Vérification de la sidebar selon l\'image');
if (sidebar) {
  console.log('✅ Sidebar présente');
  
  // Vérification du fond blanc
  const sidebarStyle = window.getComputedStyle(sidebar);
  console.log('Background de la sidebar:', sidebarStyle.background);
  
  if (sidebarStyle.background.includes('white') || sidebarStyle.background.includes('rgb(255, 255, 255)')) {
    console.log('✅ Sidebar a un fond blanc comme dans l\'image');
  } else {
    console.log('❌ Sidebar n\'a pas un fond blanc');
  }
  
  // Vérification des éléments de navigation
  const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
  console.log('Nombre de liens dans la sidebar:', sidebarLinks.length);
  
  // Vérification du premier lien actif (Tableau de bord)
  const activeLink = sidebar.querySelector('.sidebar-link.active');
  if (activeLink) {
    console.log('✅ Lien actif présent:', activeLink.textContent.trim());
    
    // Vérification du fond vert pour l'onglet actif
    const activeStyle = window.getComputedStyle(activeLink);
    if (activeStyle.background.includes('229954') || activeStyle.background.includes('rgb(34, 153, 84)')) {
      console.log('✅ Onglet actif a un fond vert comme dans l\'image');
    } else {
      console.log('❌ Onglet actif n\'a pas le fond vert attendu');
    }
  }
  
  // Vérification du bouton déconnexion rouge
  const logoutLink = sidebar.querySelector('.sidebar-link.logout');
  if (logoutLink) {
    console.log('✅ Bouton déconnexion présent');
    
    const logoutStyle = window.getComputedStyle(logoutLink);
    if (logoutStyle.color.includes('e74c3c') || logoutStyle.color.includes('rgb(231, 76, 60)')) {
      console.log('✅ Bouton déconnexion a la couleur rouge attendue');
    } else {
      console.log('❌ Bouton déconnexion n\'a pas la couleur rouge attendue');
    }
  }
} else {
  console.log('❌ Sidebar manquante pour les tests');
}

// Test 5: Vérification du contenu principal selon l'image
console.log('\n🔍 Test 5: Vérification du contenu principal selon l\'image');
if (dashboardMain) {
  console.log('✅ Main section présente');
  
  // Vérification du titre "Statistiques" en vert
  const statsTitle = dashboardMain.querySelector('.stats-section h3');
  if (statsTitle) {
    console.log('✅ Titre "Statistiques" présent:', statsTitle.textContent);
    
    const titleStyle = window.getComputedStyle(statsTitle);
    if (titleStyle.color.includes('229954') || titleStyle.color.includes('rgb(34, 153, 84)')) {
      console.log('✅ Titre "Statistiques" est en vert comme dans l\'image');
    } else {
      console.log('❌ Titre "Statistiques" n\'est pas en vert');
    }
  }
  
  // Vérification des cartes de statistiques
  const statCards = dashboardMain.querySelectorAll('.stat-card');
  console.log('Nombre de cartes de statistiques:', statCards.length);
  
  if (statCards.length >= 3) {
    console.log('✅ Au moins 3 cartes de statistiques présentes');
    
    // Vérification de la bordure verte à gauche
    statCards.forEach((card, index) => {
      const cardStyle = window.getComputedStyle(card);
      if (cardStyle.borderLeft.includes('229954') || cardStyle.borderLeft.includes('rgb(34, 153, 84)')) {
        console.log(`✅ Carte ${index + 1} a la bordure verte à gauche`);
      } else {
        console.log(`❌ Carte ${index + 1} n'a pas la bordure verte à gauche`);
      }
    });
  } else {
    console.log('❌ Pas assez de cartes de statistiques');
  }
} else {
  console.log('❌ Main section manquante pour les tests');
}

// Test 6: Vérification du footer selon l'image
console.log('\n🔍 Test 6: Vérification du footer selon l\'image');
if (dashboardFooter) {
  console.log('✅ Footer présent');
  
  // Vérification du gradient vert-jaune
  const footerStyle = window.getComputedStyle(dashboardFooter);
  console.log('Background du footer:', footerStyle.background);
  
  if (footerStyle.background.includes('linear-gradient') && 
      (footerStyle.background.includes('229954') || footerStyle.background.includes('f4d03f'))) {
    console.log('✅ Footer a un gradient vert-jaune comme dans l\'image');
  } else {
    console.log('❌ Footer n\'a pas le gradient vert-jaune attendu');
  }
  
  // Vérification du copyright
  const footerText = dashboardFooter.querySelector('p');
  if (footerText) {
    console.log('✅ Texte du footer présent:', footerText.textContent);
    
    if (footerText.textContent.includes('Ministère des Mines et de l\'Industrie')) {
      console.log('✅ Copyright correct présent');
    } else {
      console.log('❌ Copyright incorrect ou manquant');
    }
  }
} else {
  console.log('❌ Footer manquant pour les tests');
}

// Test 7: Vérification de la disposition générale
console.log('\n🔍 Test 7: Vérification de la disposition générale');
if (dashboardLayout && dashboardHeader && sidebar && dashboardMain && dashboardFooter) {
  console.log('✅ Tous les éléments de structure sont présents');
  
  // Vérification que le header est en haut
  const headerRect = dashboardHeader.getBoundingClientRect();
  if (headerRect.top === 0) {
    console.log('✅ Header est bien positionné en haut de la page');
  } else {
    console.log('❌ Header n\'est pas en haut de la page');
  }
  
  // Vérification que la sidebar est à gauche
  const sidebarRect = sidebar.getBoundingClientRect();
  if (sidebarRect.left === 0) {
    console.log('✅ Sidebar est bien positionnée à gauche');
  } else {
    console.log('❌ Sidebar n\'est pas à gauche');
  }
  
  // Vérification que le main est à droite de la sidebar
  const mainRect = dashboardMain.getBoundingClientRect();
  if (mainRect.left >= sidebarRect.width) {
    console.log('✅ Main section est bien à droite de la sidebar');
  } else {
    console.log('❌ Main section n\'est pas à droite de la sidebar');
  }
  
  // Vérification que le footer est en bas
  const footerRect = dashboardFooter.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  if (footerRect.bottom >= windowHeight - 10) {
    console.log('✅ Footer est bien positionné en bas de la page');
  } else {
    console.log('❌ Footer n\'est pas en bas de la page');
  }
} else {
  console.log('❌ Éléments manquants pour la vérification de la disposition');
}

// Test 8: Instructions de vérification visuelle finale
console.log('\n📝 Test 8: Instructions de vérification visuelle finale');
console.log('Vérifiez visuellement que:');
console.log('1. ✅ Header: Gradient vert-jaune, "Secrétariat Général" à gauche, "Tableau de bord" au centre, bouton bleu "Actualiser" à droite');
console.log('2. ✅ Sidebar: Fond blanc, "Tableau de bord" actif en vert, autres onglets en blanc, bouton "Déconnexion" rouge en bas');
console.log('3. ✅ Main: Titre "Statistiques" en vert, 3 cartes blanches avec bordure verte à gauche');
console.log('4. ✅ Footer: Gradient vert-jaune, copyright en blanc');
console.log('5. ✅ Layout: Structure claire Header (haut), Sidebar (gauche), Main (droite), Footer (bas)');

console.log('\n✅ Tests de la structure selon l\'image de référence terminés !');
console.log('🔍 Vérifiez visuellement que tout correspond exactement à l\'image');
console.log('📖 Structure attendue: Header (haut), Left Panel/Sidebar (gauche), Main Section (droite), Footer (bas)');





