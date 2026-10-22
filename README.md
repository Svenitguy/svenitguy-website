# 🌐 SvenITGuy - Enterprise Cloud Portfolio Website

Welkom bij de broncode van mijn persoonlijke portfolio-website, volledig gecentraliseerd rond mijn profiel als **Junior Cloud & Infrastructure Engineer**. Dit platform dient als mijn digitale visitekaartje om enterprise cloudprojecten, Infrastructure as Code (IaC) templates en geavanceerde on-premises labo-infrastructuren te presenteren.

## 🔗 Live Productieomgeving
* **Website:** [https://www.svenitguy.be](https://www.svenitguy.be) *(Beheerd via een custom DNS-architectuur)*

---

## 🏗️ GitOps Architectuur & Deployment Flow
De website is volledig ingericht volgens moderne DevOps-standaarden en maakt gebruik van een geautomatiseerde GitOps CI/CD workflow:

```text
[ local development ] ──( git push )──> [ GitHub Repository (main) ]
                                                    │
                                                    ▼ (SWA_TOKEN Trigger)
                                         [ GitHub Actions Pipeline ]
                                                    │
                                                    ▼ (Automated Deployment)
                                         [ Azure Static Web Apps ]
                                                    │
                                                    ▼ (Enterprise Edge CDN)
                                         [ Custom Domain: svenitguy.be ]
```

---

## 🧰 Technische Stack & Cloud Componenten

### 💻 Frontend Architecture
* **HTML5 & CSS3:** Volledig op maat gebouwd, responsive design met native dark/light mode switches.
* **JavaScript (Vanilla):** Client-side logica voor dynamische meertaligheid (Nederlands/Engels) via data-attributen (`data-lang-nl` / `data-lang-en`).

### ☁️ Cloud Infrastructure & Performance
* **Azure Static Web Apps:** Global hosting via het Microsoft enterprise edge netwerk.
* **Azure DNS-zones:** Gecentraliseerd domeinbeheer en zone-apex routering voor `svenitguy.be` en subdomeinen.

### 🤖 DevOps & Automation
* **GitHub Actions:** Geautomatiseerde build- en deployment pipelines gekoppeld aan de `main` branch.
* **Infrastructure as Code (IaC):** De provisioning van de Azure resources en DNS-records wordt volledig modulair aangestuurd via een separate Terraform architectuur-repository.

---

## 📂 Gekoppelde Cloud Projecten

* **Infrastructuur Repository (IaC):** [svenitguy-infra](https://github.com/Svenitguy/svenitguy-infra)  
  *Huisvest de Terraform modules voor de Azure Static Web App resources en de complete DNS-zone provisioning.*
* **Enterprise Azure Core Cloud Project:** [Waasland-Logistics-Azure-Project](https://github.com/Svenitguy/Waasland-Logistics-Azure-Project)  
  *Mijn enterprise-grade project waarin een volledige KMO-omgeving via Terraform en GitHub Actions (OIDC) is uitgerold volgens de Microsoft CAF- en WAF-richtlijnen.*

---

## 🎯 Projectdoelstellingen
Dit project valideert mijn praktijkkennis op het gebied van:
* Cloud engineering en web-hosting architecturen binnen **Microsoft Azure**.
* Het inrichten van veilige **CI/CD automatisering** en stabiele deployment workflows.
* Meertalige frontend-structurering zonder zware externe libraries.

---

## 👤 Auteur
* **Sven Velleman** — *Junior Cloud & Infrastructure Engineer*
* **LinkedIn:** [https://www.linkedin.com/in/sven-velleman](https://www.linkedin.com/in/sven-velleman)
* **Website:** [https://www.svenitguy.be/](https://www.svenitguy.be/)
