"use client";

import { ChevronLeft, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FAQ = [
  {
    category: "Les Mirokaï",
    items: [
      {
        q: "C'est quoi un Mirokaï ?",
        a: "Les Mirokaï sont des robots humanoïdes créés par Enchanted Tools. Ils sont conçus pour interagir naturellement avec les humains : parler, comprendre le contexte, exprimer des émotions et se déplacer de manière autonome dans des environnements du quotidien.",
      },
      {
        q: "D'où viennent les Mirokaï ?",
        a: "Selon la légende, les Mirokaï viennent de la planète Nimira, un monde baigné de Mirium — une énergie née des rêves, de l'imagination et de la créativité humaine. Miroki et Miroka, des jumeaux, ont traversé les mondes pour apporter magie et sourires sur Terre.",
      },
      {
        q: "À quoi servent-ils concrètement ?",
        a: "Les Mirokaï peuvent accueillir, informer, accompagner physiquement des personnes, transporter des objets légers (jusqu'à 1,5 kg) et réaliser des tâches répétitives. Ils s'adressent à des secteurs comme la santé, l'hôtellerie, le commerce ou les événements.",
      },
    ],
  },
  {
    category: "Capacités & limites",
    items: [
      {
        q: "Peut-on lui parler librement ?",
        a: "Oui, mais quelques règles améliorent l'expérience : parlez fort et à proximité du robot, évitez les phrases trop longues, et sachez qu'il ne mémorise pas les échanges sur la durée. Il ne reconnaît pas non plus à qui il s'adresse entre deux interactions.",
      },
      {
        q: "Quelle est son autonomie ?",
        a: "Environ 1 heure. Pour une utilisation prolongée, il doit rester branché.",
      },
      {
        q: "La robotique est-elle dangereuse ?",
        a: "Non. Les Mirokaï sont conçus pour évoluer en toute sécurité aux côtés des humains. Ils se déplacent lentement, détectent les obstacles et ne peuvent pas porter de charges lourdes. Leur conception intègre dès le départ la sécurité et l'acceptabilité émotionnelle.",
      },
      {
        q: "L'IA va-t-elle me remplacer ?",
        a: "L'objectif des Mirokaï n'est pas de remplacer les humains, mais de les assister dans les tâches répétitives ou difficiles — libérant ainsi du temps pour des activités à plus forte valeur humaine. Chez Enchanted Tools, on croit en une technologie qui crée du lien, pas qui l'efface.",
      },
    ],
  },
  {
    category: "La Mirokaï Experience",
    items: [
      {
        q: "C'est quoi la Mirokaï Experience ?",
        a: "C'est une expérience immersive ouverte au grand public tous les mercredis au 18 rue de la Fontaine au Roi, Paris 11e. Vous rencontrez les robots Mirokaï, découvrez les secrets de leur conception et participez à des activités interactives.",
      },
      {
        q: "À partir de quel âge peut-on participer ?",
        a: "L'expérience est ouverte à tous les curieux dès 6 ans. Elle est particulièrement adaptée aux familles avec enfants, mais aussi aux étudiants, technophiles et touristes.",
      },
      {
        q: "Comment réserver ?",
        a: "Les réservations se font via Eventbrite. Le lien est disponible dans la bio Instagram d'Enchanted Tools Paris (@enchantedtools.paris).",
      },
      {
        q: "Comment me rendre à l'expérience ?",
        a: "L'expérience se situe au 18 rue de la Fontaine au Roi, 75011 Paris.\n\nHoraires : 10h – 19h.\n\nEn métro : Parmentier (ligne 3), Goncourt (ligne 11) ou République (lignes 3, 5, 8, 9, 11). Des bus et parkings sont également disponibles à proximité.",
      },
    ],
  },
  {
    category: "L'application",
    items: [
      {
        q: "À quoi sert cette application ?",
        a: "Elle accompagne votre visite de la Mirokaï Experience. Elle guide votre groupe dans les différents modules, et vous permet ensuite de suivre votre progression, participer à des challenges et rester informé des prochains événements.",
      },
      {
        q: "Mes trophées peuvent-ils diminuer ?",
        a: "Non. Les trophées ne sont attribués que lorsque vous améliorez votre meilleur score sur un challenge. Refaire un challenge ne fait jamais perdre de trophées.",
      },
      {
        q: "La connexion via Google ou Facebook ne fonctionne pas ?",
        a: "Les connexions sociales sont temporairement indisponibles. Utilisez le formulaire d'inscription avec votre adresse e-mail et un mot de passe.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/5 transition-colors"
      >
        <span className="flex-1 text-white text-sm font-medium leading-snug">{q}</span>
        <ChevronDown
          className="w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          strokeWidth={1.5}
        />
      </button>
      {open && (
        <p className="px-4 pb-4 text-white/50 text-sm leading-relaxed whitespace-pre-line">{a}</p>
      )}
    </div>
  );
}

export default function FaqPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh px-5 pt-14 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push("/profil")}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
        </button>
        <h1
          className="text-xl font-bold text-white"
          style={{ fontFamily: "'ESPeak', sans-serif" }}
        >
          Questions fréquentes
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {FAQ.map((section) => (
          <div
            key={section.category}
            className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
          >
            <p className="text-white/40 text-xs uppercase tracking-widest px-4 pt-4 pb-2">
              {section.category}
            </p>
            {section.items.map((item) => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
