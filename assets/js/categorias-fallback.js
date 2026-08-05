/* ==========================================================================
   Dreamlike — categorias-fallback.js
   Copia embebida de assets/data/categorias.json, usada solo cuando fetch()
   falla (ej. sitio abierto con file:// en vez de servido por HTTP).
   Generado desde categorias.json — mantener ambos sincronizados si se edita
   el mega-menu.

   Nota: las subcategorias son taxonomia de navegacion del mega-menu, no
   todas tienen producto demo cargado en productos.json (12 SKUs de
   demostracion) — no interpretar subcategorias sin resultados como bug.
   ========================================================================== */

window.DL_CATEGORIAS_FALLBACK = [
  {
    "slug": "conductores",
    "nombre": "Conductores",
    "columnas": [
      {
        "titulo": "Cables y Alambres",
        "items": [
          {
            "nombre": "Cable THHN 2.5mm² Negro",
            "sku": "CBL-THHN-2.5-NEG"
          },
          {
            "nombre": "Alambre NYA 4mm² Rojo",
            "sku": "CBL-NYA-4-ROJ"
          },
          {
            "nombre": "Cable Libre de Halógeno 2.5mm²",
            "sku": "CBL-LSOH-2.5"
          }
        ]
      },
      {
        "titulo": "Cables Solares",
        "items": [
          {
            "nombre": "Cable Solar 6mm² Negro",
            "sku": "CBL-SOLAR-6"
          }
        ]
      },
      {
        "titulo": "Terminales y Empalme",
        "items": [
          {
            "nombre": "Terminal Tipo Ojo 4mm²",
            "sku": "TER-OJO-4"
          }
        ]
      },
      {
        "titulo": "Puesta a Tierra",
        "items": [
          {
            "nombre": "Barra de Cobre Puesta a Tierra",
            "sku": "BAR-CU-PT"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/conductores.svg"
  },
  {
    "slug": "canalizacion",
    "nombre": "Canalizacion",
    "columnas": [
      {
        "titulo": "Canaletas",
        "items": [
          {
            "nombre": "Canaleta PVC 40x25mm",
            "sku": "CAN-PVC-40X25"
          },
          {
            "nombre": "Canaleta Ranurada 20x12mm",
            "sku": "CAN-RAN-20X12"
          }
        ]
      },
      {
        "titulo": "Tuberías PVC",
        "items": [
          {
            "nombre": "Tubo Conduit PVC 20mm",
            "sku": "TUB-COND-20"
          }
        ]
      },
      {
        "titulo": "Tuberías Metálicas",
        "items": [
          {
            "nombre": "Tubo EMT 20mm",
            "sku": "TUB-EMT-20"
          },
          {
            "nombre": "Tubo Galvanizado ANSI 25mm",
            "sku": "TUB-GALV-25"
          }
        ]
      },
      {
        "titulo": "Flexibles",
        "items": [
          {
            "nombre": "Flexible Metalico 20mm",
            "sku": "FLEX-MET-20"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/canalizacion.svg"
  },
  {
    "slug": "automatizacion",
    "nombre": "Automatizacion y Control",
    "columnas": [
      {
        "titulo": "Protecciones",
        "items": [
          {
            "nombre": "Interruptor Diferencial 2P 40A",
            "sku": "BRK-DIFF-2P-40"
          },
          {
            "nombre": "Automatico 1P 16A 6kA",
            "sku": "BRK-AUT-1P-16"
          }
        ]
      },
      {
        "titulo": "Contactores y Relés",
        "items": [
          {
            "nombre": "Contactor Tripolar 25A",
            "sku": "CONT-SCH-25A"
          },
          {
            "nombre": "Rele Termico 9-13A",
            "sku": "RELE-TERM-9-13"
          }
        ]
      },
      {
        "titulo": "Control Industrial",
        "items": [
          {
            "nombre": "PLC Compacto S7-1200",
            "sku": "PLC-S7-1200"
          },
          {
            "nombre": "Variador de Frecuencia 1HP",
            "sku": "VAR-FREC-1HP"
          }
        ]
      },
      {
        "titulo": "Sensores",
        "items": [
          {
            "nombre": "Sensor de Movimiento 360°",
            "sku": "SENS-MOV-360"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/automatizacion.svg"
  },
  {
    "slug": "cctv",
    "nombre": "CCTV y Seguridad",
    "columnas": [
      {
        "titulo": "Cámaras",
        "items": [
          {
            "nombre": "Camara Domo IP 4MP",
            "sku": "CAM-DOM-4MP"
          },
          {
            "nombre": "Camara Bullet IP 4MP",
            "sku": "CAM-BUL-4MP"
          }
        ]
      },
      {
        "titulo": "Grabación",
        "items": [
          {
            "nombre": "NVR 8 Canales 4K",
            "sku": "NVR-8CH"
          }
        ]
      },
      {
        "titulo": "Redes de Datos",
        "items": [
          {
            "nombre": "Switch PoE 8 Puertos",
            "sku": "SW-POE-8P"
          }
        ]
      },
      {
        "titulo": "Almacenamiento",
        "items": [
          {
            "nombre": "Disco Duro para CCTV 2TB",
            "sku": "HDD-CCTV-2TB"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/cctv.svg"
  },
  {
    "slug": "conectores",
    "nombre": "Conectores y Terminales",
    "columnas": [
      {
        "titulo": "Terminales de Cobre",
        "items": [
          {
            "nombre": "Terminal de Cobre Tipo Ojo 4mm²",
            "sku": "TER-CU-4"
          }
        ]
      },
      {
        "titulo": "Conectores de Empalme",
        "items": [
          {
            "nombre": "Conector Dentado 6mm²",
            "sku": "CON-DENT-6"
          }
        ]
      },
      {
        "titulo": "Bornes y Regletas",
        "items": [
          {
            "nombre": "Regleta de Bornes 12 Vias",
            "sku": "REG-BORNE-12"
          }
        ]
      },
      {
        "titulo": "Termocontraíbles",
        "items": [
          {
            "nombre": "Termocontraible 10mm",
            "sku": "TERMOC-10"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/conectores.svg"
  },
  {
    "slug": "enchufes",
    "nombre": "Enchufes e Interruptores",
    "columnas": [
      {
        "titulo": "Enchufes Domiciliarios",
        "items": [
          {
            "nombre": "Enchufe Schuko Blanco",
            "sku": "ENC-SCHUKO-B"
          },
          {
            "nombre": "Enchufe Doble Blanco",
            "sku": "ENC-DOBLE-B"
          }
        ]
      },
      {
        "titulo": "Interruptores",
        "items": [
          {
            "nombre": "Interruptor Simple Blanco",
            "sku": "INT-SIMPLE-B"
          },
          {
            "nombre": "Interruptor Conmutado Blanco",
            "sku": "INT-CONM-B"
          }
        ]
      },
      {
        "titulo": "Industriales",
        "items": [
          {
            "nombre": "Enchufe Industrial IP67 16A",
            "sku": "ENC-IND-IP67"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/enchufes.svg"
  },
  {
    "slug": "iluminacion",
    "nombre": "Iluminacion",
    "columnas": [
      {
        "titulo": "Ampolletas y Tubos LED",
        "items": [
          {
            "nombre": "Ampolleta LED 9W Luz Calida",
            "sku": "AMP-LED-9W"
          },
          {
            "nombre": "Tubo LED 18W 1.2m",
            "sku": "TUBO-LED-18W"
          }
        ]
      },
      {
        "titulo": "Paneles LED",
        "items": [
          {
            "nombre": "Panel LED 60x60 40W",
            "sku": "LED-PANEL-60"
          }
        ]
      },
      {
        "titulo": "Proyectores Exterior",
        "items": [
          {
            "nombre": "Proyector LED 50W Exterior",
            "sku": "PROY-LED-50W"
          }
        ]
      },
      {
        "titulo": "Emergencia",
        "items": [
          {
            "nombre": "Equipo de Emergencia LED",
            "sku": "EQ-EMERG-LED"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/iluminacion.svg"
  },
  {
    "slug": "herramientas",
    "nombre": "Herramientas",
    "columnas": [
      {
        "titulo": "Herramienta Eléctrica",
        "items": [
          {
            "nombre": "Atornillador de Impacto 1/2\" 20V",
            "sku": "TAL-ATOR-1/2"
          },
          {
            "nombre": "Taladro Percutor 20V",
            "sku": "TAL-PERC-20V"
          }
        ]
      },
      {
        "titulo": "Herramienta Manual",
        "items": [
          {
            "nombre": "Pelacables Automatico",
            "sku": "PELACABLE-AUT"
          }
        ]
      },
      {
        "titulo": "Medición Eléctrica",
        "items": [
          {
            "nombre": "Multimetro Digital Profesional",
            "sku": "MULTIM-DIG"
          }
        ]
      },
      {
        "titulo": "Seguridad",
        "items": [
          {
            "nombre": "Guantes Dielectricos Clase 0",
            "sku": "GUANTE-DIEL-CL0"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/herramientas.svg"
  },
  {
    "slug": "ferreteria",
    "nombre": "Ferreteria",
    "columnas": [
      {
        "titulo": "Fijación",
        "items": [
          {
            "nombre": "Taco de Anclaje 8mm",
            "sku": "TACO-FISCH-8"
          }
        ]
      },
      {
        "titulo": "Tornillería",
        "items": [
          {
            "nombre": "Tornillo Hexagonal M8x40",
            "sku": "FER-TORN-M8"
          }
        ]
      },
      {
        "titulo": "Brocas y Corte",
        "items": [
          {
            "nombre": "Broca para Concreto 6mm",
            "sku": "BROCA-CONC-6"
          }
        ]
      },
      {
        "titulo": "Adhesivos y Sellos",
        "items": [
          {
            "nombre": "Cinta Aislante Negra 19mm",
            "sku": "CINTA-AISL-19"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/ferreteria.svg"
  },
  {
    "slug": "renovables",
    "nombre": "Energias Renovables",
    "columnas": [
      {
        "titulo": "Paneles Solares",
        "items": [
          {
            "nombre": "Panel Solar Monocristalino 450W",
            "sku": "PAN-SOLAR-450"
          },
          {
            "nombre": "Panel Solar Policristalino 330W",
            "sku": "PAN-SOLAR-POLI-330"
          }
        ]
      },
      {
        "titulo": "Conectores Solares",
        "items": [
          {
            "nombre": "Conector MC4",
            "sku": "CONECT-MC4"
          }
        ]
      },
      {
        "titulo": "Reguladores e Inversores",
        "items": [
          {
            "nombre": "Regulador de Carga Solar 30A",
            "sku": "REG-CARGA-30A"
          },
          {
            "nombre": "Inversor Solar 3kW On-Grid",
            "sku": "INV-SOLAR-3KW"
          }
        ]
      }
    ],
    "banner": "assets/img/categorias/renovables.svg"
  }
];
