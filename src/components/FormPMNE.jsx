// === UTILS ===
function mailActivationHTML({ nom, prenom, activationLink }) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafb; padding:0; margin:0;">
    <div style="max-width:540px;margin:32px auto;background:#fff;border-radius:14px;box-shadow:0 4px 24px #1e6a8e22;overflow:hidden;border:1.5px solid #e3e3e3;">
      <div style="background:linear-gradient(90deg,#7fa22b11 0%,#1e6a8e11 100%);text-align:center;">
        <img src="https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/62367925/2d3b2c5e-0b0f-4b4b-9e53-5e5f2b7f6f1d/banniere_mmi.jpg" alt="Ministère des Mines et de l'Industrie" style="width:100%;max-width:540px;display:block;margin:0 auto;">
      </div>
      <div style="padding:28px 28px 22px 28px;">
        <div style="color:#1e6a8e;font-size:1.25rem;font-weight:800;margin-bottom:18px;text-align:center;">
          Bienvenue sur la plateforme du Ministère des Mines et de l’Industrie
        </div>
        <p>Bonjour <b>${prenom} ${nom}</b>,<br><br>
        Merci pour votre inscription.<br>
        Pour activer votre compte et accéder à tous les services en ligne, veuillez cliquer sur le bouton ci-dessous :</p>
        <div style="text-align:center;">
          <a href="${activationLink}" style="display:inline-block;margin:22px auto 0 auto;background:linear-gradient(90deg,#1e6a8e 60%,#7fa22b 100%);color:#fff;font-weight:700;font-size:1.13rem;padding:14px 38px;border-radius:8px;text-decoration:none;box-shadow:0 2px 12px #1e6a8e22;">Activer mon compte</a>
        </div>
        <div style="border-top:1px solid #e3e3e3;margin:32px 0 18px 0;"></div>
        <p>
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          <a href="${activationLink}">${activationLink}</a>
        </p>
        <div style="margin-top:30px;font-size:0.97rem;color:#888;text-align:center;padding-bottom:18px;">
          <b>Ministère des Mines et de l’Industrie</b><br>
          Direction Générale de l’Industrie<br>
          <span style="color:#7fa22b;">République Islamique de Mauritanie</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

// === INSCRIPTION AVEC ACTIVATION ===
app.post("/api/inscription", async (req, res) => {
  const {
    nom,
    prenom,
    email,
    mot_de_passe,
    registre_commerce,
    nif,
    telephone,
    adresse,
  } = req.body;
  if (!nom || !prenom || !email || !mot_de_passe) {
    return res
      .status(400)
      .json({ error: "Tous les champs obligatoires doivent être remplis." });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [exists] = await conn.execute(
      "SELECT id FROM utilisateurs WHERE email = ?",
      [email]
    );
    if (exists.length > 0) {
      await conn.end();
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const activationToken = crypto.randomBytes(32).toString("hex");
    await conn.execute(
      `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, registre_commerce, nif, telephone, adresse, role_id, statut, email_verifie, activation_token, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10, 'EN_ATTENTE', 0, ?, NOW())`,
      [
        nom,
        prenom,
        email,
        hash,
        registre_commerce,
        nif,
        telephone,
        adresse,
        activationToken,
      ]
    );
    await conn.end();

    // Envoi du mail d'activation
    const activationLink = `${process.env.FRONTEND_URL}/activation/${activationToken}`;
    await transporter.sendMail({
      from: '"Ministère des Mines et de l’Industrie" <oumar.parhe-sow@richat-partners.com>',
      to: destinataire,
      subject:
        "Activation de votre compte - Ministère des Mines et de l’Industrie",
      html: mailActivationHTML({ nom, prenom, activationLink }),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});

// === ENDPOINT D'ACTIVATION DE COMPTE ===
app.get("/api/activation/:token", async (req, res) => {
  const { token } = req.params;
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute(
    "SELECT id FROM utilisateurs WHERE activation_token = ?",
    [token]
  );
  if (rows.length === 0) {
    await conn.end();
    return res
      .status(400)
      .json({ error: "Lien d'activation invalide ou expiré." });
  }
  await conn.execute(
    'UPDATE utilisateurs SET statut="ACTIF", email_verifie=1, activation_token=NULL WHERE id=?',
    [rows[0].id]
  );
  await conn.end();
  res.json({ success: true, message: "Votre compte est maintenant activé." });
});

// === CONNEXION ===
app.post("/api/login", async (req, res) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT * FROM utilisateurs WHERE email = ?",
      [email]
    );
    await conn.end();
    if (rows.length === 0) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }
    const user = rows[0];
    if (!(await bcrypt.compare(mot_de_passe, user.mot_de_passe))) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }
    if (user.statut !== "ACTIF" || user.email_verifie !== 1) {
      return res
        .status(403)
        .json({ error: "Veuillez activer votre compte via l'email reçu." });
    }
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role_id: user.role_id,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    const userToSend = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role_id: user.role_id,
      registre_commerce: user.registre_commerce,
      nif: user.nif,
      telephone: user.telephone,
      adresse: user.adresse,
      statut: user.statut,
      email_verifie: user.email_verifie,
      derniere_connexion: user.derniere_connexion,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
    res.json({ token, user: userToSend });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});

// === MOT DE PASSE OUBLIÉ ===
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  const [users] = await conn.execute(
    "SELECT id, nom, prenom FROM utilisateurs WHERE email=?",
    [email]
  );
  if (users.length === 0) {
    await conn.end();
    return res.status(200).json({ success: true }); // Ne jamais révéler si l'email existe ou non
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  await conn.execute(
    "UPDATE utilisateurs SET reset_token=?, reset_token_expire=DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id=?",
    [resetToken, users[0].id]
  );
  await conn.end();

  // Envoi mail
  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
  await transporter.sendMail({
    from: '"Ministère des Mines et de l’Industrie" <oumar.parhe-sow@richat-partners.com>',
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif;">
        <h2 style="color:#1e6a8e;">Réinitialisation de votre mot de passe</h2>
        <p>Bonjour <b>${users[0].prenom} ${users[0].nom}</b>,<br>
        Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :</p>
        <a href="${resetLink}" style="display:inline-block;background:#1e6a8e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:18px 0;">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 1 heure.<br>
        Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  });

  res.json({ success: true });
});

// === RÉINITIALISATION DU MOT DE PASSE ===
app.post("/api/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { nouveau_mot_de_passe } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  const [users] = await conn.execute(
    "SELECT id FROM utilisateurs WHERE reset_token=? AND reset_token_expire > NOW()",
    [token]
  );
  if (users.length === 0) {
    await conn.end();
    return res.status(400).json({ error: "Lien invalide ou expiré" });
  }
  const hash = await bcrypt.hash(nouveau_mot_de_passe, 10);
  await conn.execute(
    "UPDATE utilisateurs SET mot_de_passe=?, reset_token=NULL, reset_token_expire=NULL WHERE id=?",
    [hash, users[0].id]
  );
  await conn.end();
  res.json({ success: true });
});

// === DASHBOARD DEMANDEUR ===
app.get("/api/demandeur/stats", async (req, res) => {
  const userId = req.query.userId;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [total] = await conn.execute(
      "SELECT COUNT(*) AS total FROM demandes WHERE utilisateur_id=?",
      [userId]
    );
    const [enCours] = await conn.execute(
      'SELECT COUNT(*) AS enCours FROM demandes WHERE utilisateur_id=? AND statut="EN_COURS"',
      [userId]
    );
    const [approuvees] = await conn.execute(
      'SELECT COUNT(*) AS approuvees FROM demandes WHERE utilisateur_id=? AND statut="APPROUVEE"',
      [userId]
    );
    const [refusees] = await conn.execute(
      'SELECT COUNT(*) AS refusees FROM demandes WHERE utilisateur_id=? AND statut="REFUSEE"',
      [userId]
    );
    await conn.end();
    res.json({
      total: total[0].total,
      enCours: enCours[0].enCours,
      approuvees: approuvees[0].approuvees,
      refusees: refusees[0].refusees,
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur stats" });
  }
});

// === NOTIFICATIONS ===
app.get("/api/notifications", async (req, res) => {
  const user_id = req.query.user_id;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});

app.post("/api/notifications/lu", async (req, res) => {
  const { notification_id } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute("UPDATE notifications SET lu=1 WHERE id=?", [
      notification_id,
    ]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});

// === MES DEMANDES ===
app.get("/api/mes-demandes", async (req, res) => {
  const user_id = req.query.user_id;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT id, reference, type, statut, created_at, fichiers FROM demandes WHERE utilisateur_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    rows.forEach((d) => {
      try {
        d.fichiers = JSON.parse(d.fichiers);
      } catch {
        d.fichiers = {};
      }
    });
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});

// === UPLOAD DEMANDE (avec référence unique) ===
async function generateReference(conn) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const [[{ seq }]] = await conn.execute(
    "SELECT COUNT(*)+1 AS seq FROM demandes WHERE DATE(created_at) = CURDATE()"
  );
  return `${date}-${String(seq).padStart(4, "0")}`;
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ref = req.reference || "temp";
    const dir = path.join(__dirname, "uploads", ref);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });
const generateReferenceMiddleware = async (req, res, next) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    req.reference = await generateReference(conn);
    await conn.end();
    next();
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la génération de la référence : " + err.message,
    });
  }
};

app.post(
  "/api/nouvelle-demande",
  generateReferenceMiddleware,
  upload.any(),
  async (req, res) => {
    try {
      const { typeDemande, utilisateur_id, ...fields } = req.body;
      if (!typeDemande || !utilisateur_id) {
        return res
          .status(400)
          .json({ error: "Champs obligatoires manquants." });
      }
      const conn = await mysql.createConnection(dbConfig);

      // Limite à une seule demande par type en cours
      const [existing] = await conn.execute(
        'SELECT id FROM demandes WHERE utilisateur_id = ? AND type = ? AND statut NOT IN ("CLOTUREE", "REJETEE")',
        [utilisateur_id, typeDemande]
      );
      if (existing.length > 0) {
        await conn.end();
        return res
          .status(400)
          .json({ error: "Vous avez déjà une demande en cours pour ce type." });
      }

      const reference = req.reference;
      const files = {};
      if (req.files && req.files.length > 0) {
        req.files.forEach((f) => {
          files[f.fieldname] = path.join(reference, f.filename);
        });
      }

      await conn.execute(
        `INSERT INTO demandes (utilisateur_id, type, statut, reference, donnees, fichiers, created_at)
         VALUES (?, ?, 'DEPOSEE', ?, ?, ?, NOW())`,
        [
          utilisateur_id,
          typeDemande,
          reference,
          JSON.stringify(fields),
          JSON.stringify(files),
        ]
      );
      await conn.end();
      res.json({ success: "Demande enregistrée !", reference });
    } catch (err) {
      res.status(500).json({ error: "Erreur serveur : " + err.message });
    }
  }
);
