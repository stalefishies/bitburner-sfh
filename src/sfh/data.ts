import { NS } from "netscript";

const dump = {
    "augs": {
        "Unstable Circadian Modulator": {
            "baseCost": 5000000000,
            "baseRepRequirement": 362500,
            "isSpecial": false,
            "name": "Unstable Circadian Modulator",
            "prereqs": [],
            "mults": {},
            "startingCost": 5000000000,
            "info": "An experimental nanobot injection. Its unstable nature leads to unpredictable results based on your circadian rhythm.",
            "stats": "This augmentation's effects are randomly re-rolled from a list every hour, but fixed once installed, see the game source code for details"
        },
        "HemoRecirculator": {
            "baseCost": 45000000,
            "baseRepRequirement": 10000,
            "isSpecial": false,
            "name": "HemoRecirculator",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.08,
                "defense_mult": 1.08,
                "dexterity_mult": 1.08,
                "agility_mult": 1.08
            },
            "startingCost": 45000000,
            "info": "A heart implant that greatly increases the body's ability to effectively use and pump blood.",
            "stats": "Effects:\n+8% combat skills"
        },
        "Augmented Targeting I": {
            "baseCost": 15000000,
            "baseRepRequirement": 5000,
            "isSpecial": false,
            "name": "Augmented Targeting I",
            "prereqs": [],
            "mults": {
                "dexterity_mult": 1.1
            },
            "startingCost": 15000000,
            "info": "A cranial implant that is embedded within the inner ear structures and optic nerves. It regulates and enhances balance and hand-eye coordination.",
            "stats": "Effects:\n+10% dexterity skill"
        },
        "Augmented Targeting II": {
            "baseCost": 42500000,
            "baseRepRequirement": 8750,
            "isSpecial": false,
            "name": "Augmented Targeting II",
            "prereqs": [
                "Augmented Targeting I"
            ],
            "mults": {
                "dexterity_mult": 1.2
            },
            "startingCost": 42500000,
            "info": "This upgraded version of the 'Augmented Targeting' implant is capable of augmenting reality by digitally displaying weaknesses and vital signs of threats.",
            "stats": "Effects:\n+20% dexterity skill"
        },
        "Augmented Targeting III": {
            "baseCost": 115000000,
            "baseRepRequirement": 27500,
            "isSpecial": false,
            "name": "Augmented Targeting III",
            "prereqs": [
                "Augmented Targeting II"
            ],
            "mults": {
                "dexterity_mult": 1.3
            },
            "startingCost": 115000000,
            "info": "The latest version of the 'Augmented Targeting' implant adds the ability to lock-on and track threats.",
            "stats": "Effects:\n+30% dexterity skill"
        },
        "Synthetic Heart": {
            "baseCost": 2875000000,
            "baseRepRequirement": 750000,
            "isSpecial": false,
            "name": "Synthetic Heart",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.5,
                "agility_mult": 1.5
            },
            "startingCost": 2875000000,
            "info": "This advanced artificial heart, created from plasteel and graphene, is capable of pumping blood more efficiently than an organic heart.",
            "stats": "Effects:\n+50% strength skill\n+50% agility skill"
        },
        "Synfibril Muscle": {
            "baseCost": 1125000000,
            "baseRepRequirement": 437500,
            "isSpecial": false,
            "name": "Synfibril Muscle",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.3,
                "defense_mult": 1.3
            },
            "startingCost": 1125000000,
            "info": "The myofibrils in human muscles are injected with special chemicals that react with the proteins inside the myofibrils, altering their underlying structure. The end result is muscles that are stronger and more elastic. Scientists have named these artificially enhanced units 'synfibrils'.",
            "stats": "Effects:\n+30% strength skill\n+30% defense skill"
        },
        "Combat Rib I": {
            "baseCost": 23750000,
            "baseRepRequirement": 7500,
            "isSpecial": false,
            "name": "Combat Rib I",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.1,
                "defense_mult": 1.1
            },
            "startingCost": 23750000,
            "info": "The rib cage is augmented to continuously release boosters into the bloodstream which increase the oxygen-carrying capacity of blood.",
            "stats": "Effects:\n+10% strength skill\n+10% defense skill"
        },
        "Combat Rib II": {
            "baseCost": 65000000,
            "baseRepRequirement": 18750,
            "isSpecial": false,
            "name": "Combat Rib II",
            "prereqs": [
                "Combat Rib I"
            ],
            "mults": {
                "strength_mult": 1.14,
                "defense_mult": 1.14
            },
            "startingCost": 65000000,
            "info": "An upgraded version of the 'Combat Rib' augmentation that adds potent stimulants which improve focus and endurance while decreasing reaction time and fatigue.",
            "stats": "Effects:\n+14% strength skill\n+14% defense skill"
        },
        "Combat Rib III": {
            "baseCost": 120000000,
            "baseRepRequirement": 35000,
            "isSpecial": false,
            "name": "Combat Rib III",
            "prereqs": [
                "Combat Rib II"
            ],
            "mults": {
                "strength_mult": 1.18,
                "defense_mult": 1.18
            },
            "startingCost": 120000000,
            "info": "The latest version of the 'Combat Rib' augmentation releases advanced anabolic steroids that improve muscle mass and physical performance while being safe and free of side effects.",
            "stats": "Effects:\n+18% strength skill\n+18% defense skill"
        },
        "Nanofiber Weave": {
            "baseCost": 125000000,
            "baseRepRequirement": 37500,
            "isSpecial": false,
            "name": "Nanofiber Weave",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.2,
                "defense_mult": 1.2
            },
            "startingCost": 125000000,
            "info": "Synthetic nanofibers are woven into the skin's extracellular matrix using electrospinning, which improves its regenerative and extracellular homeostasis abilities.",
            "stats": "Effects:\n+20% strength skill\n+20% defense skill"
        },
        "NEMEAN Subdermal Weave": {
            "baseCost": 3250000000,
            "baseRepRequirement": 875000,
            "isSpecial": false,
            "name": "NEMEAN Subdermal Weave",
            "prereqs": [],
            "mults": {
                "defense_mult": 2.2
            },
            "startingCost": 3250000000,
            "info": "The NEMEAN Subdermal Weave is a thin, light-weight, graphene plating that houses a dilatant fluid. The material is implanted underneath the skin, and is the most advanced form of defensive enhancement that has ever been created. The dilatant fluid, despite being thin and light, is extremely effective at stopping piercing blows and reducing blunt trauma. The properties of graphene allow the plating to mitigate damage from any fire or electrical traumas.",
            "stats": "Effects:\n+120% defense skill"
        },
        "Wired Reflexes": {
            "baseCost": 2500000,
            "baseRepRequirement": 1250,
            "isSpecial": false,
            "name": "Wired Reflexes",
            "prereqs": [],
            "mults": {
                "dexterity_mult": 1.05,
                "agility_mult": 1.05
            },
            "startingCost": 2500000,
            "info": "Synthetic nerve-enhancements are injected into all major parts of the somatic nervous system, supercharging the spread of neural signals and increasing reflex speed.",
            "stats": "Effects:\n+5% dexterity skill\n+5% agility skill"
        },
        "Graphene Bone Lacings": {
            "baseCost": 4250000000,
            "baseRepRequirement": 1125000,
            "isSpecial": false,
            "name": "Graphene Bone Lacings",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.7,
                "defense_mult": 1.7
            },
            "startingCost": 4250000000,
            "info": "Graphene is grafted and fused into the skeletal structure, enhancing bone density and tensile strength.",
            "stats": "Effects:\n+70% strength skill\n+70% defense skill"
        },
        "Bionic Spine": {
            "baseCost": 125000000,
            "baseRepRequirement": 45000,
            "isSpecial": false,
            "name": "Bionic Spine",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.15,
                "defense_mult": 1.15,
                "dexterity_mult": 1.15,
                "agility_mult": 1.15
            },
            "startingCost": 125000000,
            "info": "The spine is reconstructed using plasteel and carbon fibers. It is now capable of stimulating and regulating neural signals passing through the spinal cord, improving senses and reaction speed. The 'Bionic Spine' also interfaces with all other 'Bionic' implants.",
            "stats": "Effects:\n+15% combat skills"
        },
        "Graphene Bionic Spine Upgrade": {
            "baseCost": 6000000000,
            "baseRepRequirement": 1625000,
            "isSpecial": false,
            "name": "Graphene Bionic Spine Upgrade",
            "prereqs": [
                "Bionic Spine"
            ],
            "mults": {
                "strength_mult": 1.6,
                "defense_mult": 1.6,
                "dexterity_mult": 1.6,
                "agility_mult": 1.6
            },
            "startingCost": 6000000000,
            "info": "An upgrade to the 'Bionic Spine' augmentation. The spine is fused with graphene which enhances durability and supercharges all body functions.",
            "stats": "Effects:\n+60% combat skills"
        },
        "Bionic Legs": {
            "baseCost": 375000000,
            "baseRepRequirement": 150000,
            "isSpecial": false,
            "name": "Bionic Legs",
            "prereqs": [],
            "mults": {
                "agility_mult": 1.6
            },
            "startingCost": 375000000,
            "info": "Cybernetic legs, created from plasteel and carbon fibers, enhance running speed.",
            "stats": "Effects:\n+60% agility skill"
        },
        "Graphene Bionic Legs Upgrade": {
            "baseCost": 4500000000,
            "baseRepRequirement": 750000,
            "isSpecial": false,
            "name": "Graphene Bionic Legs Upgrade",
            "prereqs": [
                "Bionic Legs"
            ],
            "mults": {
                "agility_mult": 2.5
            },
            "startingCost": 4500000000,
            "info": "An upgrade to the 'Bionic Legs' augmentation. The legs are fused with graphene, greatly enhancing jumping ability.",
            "stats": "Effects:\n+150% agility skill"
        },
        "Speech Processor Implant": {
            "baseCost": 50000000,
            "baseRepRequirement": 7500,
            "isSpecial": false,
            "name": "Speech Processor Implant",
            "prereqs": [],
            "mults": {
                "charisma_mult": 1.2
            },
            "startingCost": 50000000,
            "info": "A cochlear implant with an embedded computer that analyzes incoming speech. The embedded computer processes characteristics of incoming speech, such as tone and inflection, to pick up on subtle cues and aid in social interactions.",
            "stats": "Effects:\n+20% Charisma skill"
        },
        "TITN-41 Gene-Modification Injection": {
            "baseCost": 190000000,
            "baseRepRequirement": 25000,
            "isSpecial": false,
            "name": "TITN-41 Gene-Modification Injection",
            "prereqs": [],
            "mults": {
                "charisma_mult": 1.15,
                "charisma_exp_mult": 1.15
            },
            "startingCost": 190000000,
            "info": "TITN is a series of viruses that targets and alters the sequences of human DNA in genes that control personality. The TITN-41 strain alters these genes so that the subject becomes more outgoing and socialable.",
            "stats": "Effects:\n+15% Charisma skill\n+15% charisma exp"
        },
        "Enhanced Social Interaction Implant": {
            "baseCost": 1375000000,
            "baseRepRequirement": 375000,
            "isSpecial": false,
            "name": "Enhanced Social Interaction Implant",
            "prereqs": [],
            "mults": {
                "charisma_mult": 1.6,
                "charisma_exp_mult": 1.6
            },
            "startingCost": 1375000000,
            "info": "A cranial implant that greatly assists in the user's ability to analyze social situations and interactions. The system uses a wide variety of factors such as facial expressions, body language, and the voice tone, and inflection to determine the best course of action during socialsituations. The implant also uses deep learning software to continuously learn new behaviorpatterns and how to best respond.",
            "stats": "Effects:\n+60% Charisma skill\n+60% charisma exp"
        },
        "BitWire": {
            "baseCost": 10000000,
            "baseRepRequirement": 3750,
            "isSpecial": false,
            "name": "BitWire",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.05
            },
            "startingCost": 10000000,
            "info": "A small brain implant embedded in the cerebrum. This regulates and improves the brain's computing capabilities.",
            "stats": "Effects:\n+5% hacking skill"
        },
        "Artificial Bio-neural Network Implant": {
            "baseCost": 3000000000,
            "baseRepRequirement": 275000,
            "isSpecial": false,
            "name": "Artificial Bio-neural Network Implant",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.12,
                "hacking_speed_mult": 1.03,
                "hacking_money_mult": 1.15
            },
            "startingCost": 3000000000,
            "info": "A network consisting of millions of nanoprocessors is embedded into the brain. The network is meant to mimic the way a biological brain solves a problem, with each nanoprocessor acting similar to the way a neuron would in a neural network. However, these nanoprocessors are programmed to perform computations much faster than organic neurons, allowing the user to solve much more complex problems at a much faster rate.",
            "stats": "Effects:\n+12% hacking skill\n+3% faster hack(), grow(), and weaken()\n+15% hack() power"
        },
        "Artificial Synaptic Potentiation": {
            "baseCost": 80000000,
            "baseRepRequirement": 6250,
            "isSpecial": false,
            "name": "Artificial Synaptic Potentiation",
            "prereqs": [],
            "mults": {
                "hacking_exp_mult": 1.05,
                "hacking_chance_mult": 1.05,
                "hacking_speed_mult": 1.02
            },
            "startingCost": 80000000,
            "info": "The body is injected with a chemical that artificially induces synaptic potentiation, otherwise known as the strengthening of synapses. This results in enhanced cognitive abilities.",
            "stats": "Effects:\n+5% hacking exp\n+2% faster hack(), grow(), and weaken()\n+5% hack() success chance"
        },
        "Enhanced Myelin Sheathing": {
            "baseCost": 1375000000,
            "baseRepRequirement": 100000,
            "isSpecial": false,
            "name": "Enhanced Myelin Sheathing",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.08,
                "hacking_exp_mult": 1.1,
                "hacking_speed_mult": 1.03
            },
            "startingCost": 1375000000,
            "info": "Electrical signals are used to induce a new, artificial form of myelinogenesis in the human body. This process results in the proliferation of new, synthetic myelin sheaths in the nervous system. These myelin sheaths can propogate neuro-signals much faster than their organic counterparts, leading to greater processing speeds and better brain function.",
            "stats": "Effects:\n+8% hacking skill\n+10% hacking exp\n+3% faster hack(), grow(), and weaken()"
        },
        "Synaptic Enhancement Implant": {
            "baseCost": 7500000,
            "baseRepRequirement": 2000,
            "isSpecial": false,
            "name": "Synaptic Enhancement Implant",
            "prereqs": [],
            "mults": {
                "hacking_speed_mult": 1.03
            },
            "startingCost": 7500000,
            "info": "A small cranial implant that continuously uses weak electrical signals to stimulate the brain and induce stronger synaptic activity. This improves the user's cognitive abilities.",
            "stats": "Effects:\n+3% faster hack(), grow(), and weaken()"
        },
        "Neural-Retention Enhancement": {
            "baseCost": 250000000,
            "baseRepRequirement": 20000,
            "isSpecial": false,
            "name": "Neural-Retention Enhancement",
            "prereqs": [],
            "mults": {
                "hacking_exp_mult": 1.25
            },
            "startingCost": 250000000,
            "info": "Chemical injections are used to permanently alter and strengthen the brain's neuronal circuits, strengthening the ability to retain information.",
            "stats": "Effects:\n+25% hacking exp"
        },
        "DataJack": {
            "baseCost": 450000000,
            "baseRepRequirement": 112500,
            "isSpecial": false,
            "name": "DataJack",
            "prereqs": [],
            "mults": {
                "hacking_money_mult": 1.25
            },
            "startingCost": 450000000,
            "info": "A brain implant that provides an interface for direct, wireless communication between a computer's main memory and the mind. This implant allows the user to not only access a computer's memory, but also alter and delete it.",
            "stats": "Effects:\n+25% hack() power"
        },
        "Embedded Netburner Module": {
            "baseCost": 250000000,
            "baseRepRequirement": 15000,
            "isSpecial": false,
            "name": "Embedded Netburner Module",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.08
            },
            "startingCost": 250000000,
            "info": "A thin device embedded inside the arm containing a wireless module capable of connecting to nearby networks. Once connected, the Netburner Module is capable of capturing and processing all of the traffic on that network. By itself, the Embedded Netburner Module does not do much, but a variety of very powerful upgrades can be installed that allow you to fully control the traffic on a network.",
            "stats": "Effects:\n+8% hacking skill"
        },
        "Embedded Netburner Module Core Implant": {
            "baseCost": 2500000000,
            "baseRepRequirement": 175000,
            "isSpecial": false,
            "name": "Embedded Netburner Module Core Implant",
            "prereqs": [
                "Embedded Netburner Module"
            ],
            "mults": {
                "hacking_mult": 1.07,
                "hacking_exp_mult": 1.07,
                "hacking_chance_mult": 1.03,
                "hacking_speed_mult": 1.03,
                "hacking_money_mult": 1.1
            },
            "startingCost": 2500000000,
            "info": "The Core library is an implant that upgrades the firmware of the Embedded Netburner Module. This upgrade allows the Embedded Netburner Module to generate its own data on a network.",
            "stats": "Effects:\n+7% hacking skill\n+7% hacking exp\n+3% faster hack(), grow(), and weaken()\n+3% hack() success chance\n+10% hack() power"
        },
        "Embedded Netburner Module Core V2 Upgrade": {
            "baseCost": 4500000000,
            "baseRepRequirement": 1000000,
            "isSpecial": false,
            "name": "Embedded Netburner Module Core V2 Upgrade",
            "prereqs": [
                "Embedded Netburner Module Core Implant"
            ],
            "mults": {
                "hacking_mult": 1.08,
                "hacking_exp_mult": 1.15,
                "hacking_chance_mult": 1.05,
                "hacking_speed_mult": 1.05,
                "hacking_money_mult": 1.3
            },
            "startingCost": 4500000000,
            "info": "The Core V2 library is an implant that upgrades the firmware of the Embedded Netburner Module. This upgraded firmware allows the Embedded Netburner Module to control information on a network by re-routing traffic, spoofing IP addresses, and altering the data inside network packets.",
            "stats": "Effects:\n+8% hacking skill\n+15% hacking exp\n+5% faster hack(), grow(), and weaken()\n+5% hack() success chance\n+30% hack() power"
        },
        "Embedded Netburner Module Core V3 Upgrade": {
            "baseCost": 7500000000,
            "baseRepRequirement": 1750000,
            "isSpecial": false,
            "name": "Embedded Netburner Module Core V3 Upgrade",
            "prereqs": [
                "Embedded Netburner Module Core V2 Upgrade"
            ],
            "mults": {
                "hacking_mult": 1.1,
                "hacking_exp_mult": 1.25,
                "hacking_chance_mult": 1.1,
                "hacking_speed_mult": 1.05,
                "hacking_money_mult": 1.4
            },
            "startingCost": 7500000000,
            "info": "The Core V3 library is an implant that upgrades the firmware of the Embedded Netburner Module. This upgraded firmware allows the Embedded Netburner Module to seamlessly inject code into any device on a network.",
            "stats": "Effects:\n+10% hacking skill\n+25% hacking exp\n+5% faster hack(), grow(), and weaken()\n+10% hack() success chance\n+40% hack() power"
        },
        "Embedded Netburner Module Analyze Engine": {
            "baseCost": 6000000000,
            "baseRepRequirement": 625000,
            "isSpecial": false,
            "name": "Embedded Netburner Module Analyze Engine",
            "prereqs": [
                "Embedded Netburner Module"
            ],
            "mults": {
                "hacking_speed_mult": 1.1
            },
            "startingCost": 6000000000,
            "info": "Installs the Analyze Engine for the Embedded Netburner Module, which is a CPU cluster that vastly outperforms the Netburner Module's native single-core processor.",
            "stats": "Effects:\n+10% faster hack(), grow(), and weaken()"
        },
        "Embedded Netburner Module Direct Memory Access Upgrade": {
            "baseCost": 7000000000,
            "baseRepRequirement": 1000000,
            "isSpecial": false,
            "name": "Embedded Netburner Module Direct Memory Access Upgrade",
            "prereqs": [
                "Embedded Netburner Module"
            ],
            "mults": {
                "hacking_chance_mult": 1.2,
                "hacking_money_mult": 1.4
            },
            "startingCost": 7000000000,
            "info": "This implant installs a Direct Memory Access (DMA) controller into the Embedded Netburner Module. This allows the Module to send and receive data directly to and from the main memory of devices on a network.",
            "stats": "Effects:\n+20% hack() success chance\n+40% hack() power"
        },
        "Neuralstimulator": {
            "baseCost": 3000000000,
            "baseRepRequirement": 50000,
            "isSpecial": false,
            "name": "Neuralstimulator",
            "prereqs": [],
            "mults": {
                "hacking_exp_mult": 1.12,
                "hacking_chance_mult": 1.1,
                "hacking_speed_mult": 1.02
            },
            "startingCost": 3000000000,
            "info": "A cranial implant that intelligently stimulates certain areas of the brain in order to improve cognitive functions.",
            "stats": "Effects:\n+12% hacking exp\n+2% faster hack(), grow(), and weaken()\n+10% hack() success chance"
        },
        "Neural Accelerator": {
            "baseCost": 1750000000,
            "baseRepRequirement": 200000,
            "isSpecial": false,
            "name": "Neural Accelerator",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.1,
                "hacking_exp_mult": 1.15,
                "hacking_money_mult": 1.2
            },
            "startingCost": 1750000000,
            "info": "A microprocessor that accelerates the processing speed of biological neural networks. This is a cranial implant that is embedded inside the brain.",
            "stats": "Effects:\n+10% hacking skill\n+15% hacking exp\n+20% hack() power"
        },
        "Cranial Signal Processors - Gen I": {
            "baseCost": 70000000,
            "baseRepRequirement": 10000,
            "isSpecial": false,
            "name": "Cranial Signal Processors - Gen I",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.05,
                "hacking_speed_mult": 1.01
            },
            "startingCost": 70000000,
            "info": "The first generation of Cranial Signal Processors. Cranial Signal Processors are a set of specialized microprocessors that are attached to neurons in the brain. These chips process neural signals to quickly and automatically perform specific computations so that the brain doesn't have to.",
            "stats": "Effects:\n+5% hacking skill\n+1% faster hack(), grow(), and weaken()"
        },
        "Cranial Signal Processors - Gen II": {
            "baseCost": 125000000,
            "baseRepRequirement": 18750,
            "isSpecial": false,
            "name": "Cranial Signal Processors - Gen II",
            "prereqs": [
                "Cranial Signal Processors - Gen I"
            ],
            "mults": {
                "hacking_mult": 1.07,
                "hacking_chance_mult": 1.05,
                "hacking_speed_mult": 1.02
            },
            "startingCost": 125000000,
            "info": "The second generation of Cranial Signal Processors. Cranial Signal Processors are a set of specialized microprocessors that are attached to neurons in the brain. These chips process neural signals to quickly and automatically perform specific computations so that the brain doesn't have to.",
            "stats": "Effects:\n+7% hacking skill\n+2% faster hack(), grow(), and weaken()\n+5% hack() success chance"
        },
        "Cranial Signal Processors - Gen III": {
            "baseCost": 550000000,
            "baseRepRequirement": 50000,
            "isSpecial": false,
            "name": "Cranial Signal Processors - Gen III",
            "prereqs": [
                "Cranial Signal Processors - Gen II"
            ],
            "mults": {
                "hacking_mult": 1.09,
                "hacking_speed_mult": 1.02,
                "hacking_money_mult": 1.15
            },
            "startingCost": 550000000,
            "info": "The third generation of Cranial Signal Processors. Cranial Signal Processors are a set of specialized microprocessors that are attached to neurons in the brain. These chips process neural signals to quickly and automatically perform specific computations so that the brain doesn't have to.",
            "stats": "Effects:\n+9% hacking skill\n+2% faster hack(), grow(), and weaken()\n+15% hack() power"
        },
        "Cranial Signal Processors - Gen IV": {
            "baseCost": 1100000000,
            "baseRepRequirement": 125000,
            "isSpecial": false,
            "name": "Cranial Signal Processors - Gen IV",
            "prereqs": [
                "Cranial Signal Processors - Gen III"
            ],
            "mults": {
                "hacking_speed_mult": 1.02,
                "hacking_money_mult": 1.2,
                "hacking_grow_mult": 1.25
            },
            "startingCost": 1100000000,
            "info": "The fourth generation of Cranial Signal Processors. Cranial Signal Processors are a set of specialized microprocessors that are attached to neurons in the brain. These chips process neural signals to quickly and automatically perform specific computations so that the brain doesn't have to.",
            "stats": "Effects:\n+2% faster hack(), grow(), and weaken()\n+20% hack() power\n+25% grow() power"
        },
        "Cranial Signal Processors - Gen V": {
            "baseCost": 2250000000,
            "baseRepRequirement": 250000,
            "isSpecial": false,
            "name": "Cranial Signal Processors - Gen V",
            "prereqs": [
                "Cranial Signal Processors - Gen IV"
            ],
            "mults": {
                "hacking_mult": 1.3,
                "hacking_money_mult": 1.25,
                "hacking_grow_mult": 1.75
            },
            "startingCost": 2250000000,
            "info": "The fifth generation of Cranial Signal Processors. Cranial Signal Processors are a set of specialized microprocessors that are attached to neurons in the brain. These chips process neural signals to quickly and automatically perform specific computations so that the brain doesn't have to.",
            "stats": "Effects:\n+30% hacking skill\n+25% hack() power\n+75% grow() power"
        },
        "Neuronal Densification": {
            "baseCost": 1375000000,
            "baseRepRequirement": 187500,
            "isSpecial": false,
            "name": "Neuronal Densification",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.15,
                "hacking_exp_mult": 1.1,
                "hacking_speed_mult": 1.03
            },
            "startingCost": 1375000000,
            "info": "The brain is surgically re-engineered to have increased neuronal density by decreasing the neuron gap junction. Then, the body is genetically modified to enhance the production and capabilities of its neural stem cells.",
            "stats": "Effects:\n+15% hacking skill\n+10% hacking exp\n+3% faster hack(), grow(), and weaken()"
        },
        "Nuoptimal Nootropic Injector Implant": {
            "baseCost": 20000000,
            "baseRepRequirement": 5000,
            "isSpecial": false,
            "name": "Nuoptimal Nootropic Injector Implant",
            "prereqs": [],
            "mults": {
                "company_rep_mult": 1.2
            },
            "startingCost": 20000000,
            "info": "This torso implant automatically injects nootropic supplements into the bloodstream to improve memory, increase focus, and provide other cognitive enhancements.",
            "stats": "Effects:\n+20% reputation from companies"
        },
        "Speech Enhancement": {
            "baseCost": 12500000,
            "baseRepRequirement": 2500,
            "isSpecial": false,
            "name": "Speech Enhancement",
            "prereqs": [],
            "mults": {
                "charisma_mult": 1.1,
                "company_rep_mult": 1.1
            },
            "startingCost": 12500000,
            "info": "An advanced neural implant that improves your speaking abilities, making you more convincing and likable in conversations and overall improving your social interactions.",
            "stats": "Effects:\n+10% Charisma skill\n+10% reputation from companies"
        },
        "FocusWire": {
            "baseCost": 900000000,
            "baseRepRequirement": 75000,
            "isSpecial": false,
            "name": "FocusWire",
            "prereqs": [],
            "mults": {
                "hacking_exp_mult": 1.05,
                "strength_exp_mult": 1.05,
                "defense_exp_mult": 1.05,
                "dexterity_exp_mult": 1.05,
                "agility_exp_mult": 1.05,
                "charisma_exp_mult": 1.05,
                "company_rep_mult": 1.1,
                "work_money_mult": 1.2
            },
            "startingCost": 900000000,
            "info": "A cranial implant that stops procrastination by blocking specific neural pathways in the brain.",
            "stats": "Effects:\n+5% exp for all skills\n+10% reputation from companies\n+20% work money"
        },
        "PC Direct-Neural Interface": {
            "baseCost": 3750000000,
            "baseRepRequirement": 375000,
            "isSpecial": false,
            "name": "PC Direct-Neural Interface",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.08,
                "company_rep_mult": 1.3
            },
            "startingCost": 3750000000,
            "info": "Installs a Direct-Neural Interface jack into your arm that is compatible with most computers. Connecting to a computer through this jack allows you to interface with it using the brain's electrochemical signals.",
            "stats": "Effects:\n+8% hacking skill\n+30% reputation from companies"
        },
        "PC Direct-Neural Interface Optimization Submodule": {
            "baseCost": 4500000000,
            "baseRepRequirement": 500000,
            "isSpecial": false,
            "name": "PC Direct-Neural Interface Optimization Submodule",
            "prereqs": [
                "PC Direct-Neural Interface"
            ],
            "mults": {
                "hacking_mult": 1.1,
                "company_rep_mult": 1.75
            },
            "startingCost": 4500000000,
            "info": "This is a submodule upgrade to the PC Direct-Neural Interface augmentation. It improves the performance of the interface and gives the user more control options to a connected computer.",
            "stats": "Effects:\n+10% hacking skill\n+75% reputation from companies"
        },
        "PC Direct-Neural Interface NeuroNet Injector": {
            "baseCost": 7500000000,
            "baseRepRequirement": 1500000,
            "isSpecial": false,
            "name": "PC Direct-Neural Interface NeuroNet Injector",
            "prereqs": [
                "PC Direct-Neural Interface"
            ],
            "mults": {
                "hacking_mult": 1.1,
                "hacking_speed_mult": 1.05,
                "company_rep_mult": 2
            },
            "startingCost": 7500000000,
            "info": "This is an additional installation that upgrades the functionality of the PC Direct-Neural Interface augmentation. When connected to a computer, The Neural Network upgrade allows the user to use their own brain's processing power to aid the computer in computational tasks.",
            "stats": "Effects:\n+10% hacking skill\n+5% faster hack(), grow(), and weaken()\n+100% reputation from companies"
        },
        "ADR-V1 Pheromone Gene": {
            "baseCost": 17500000,
            "baseRepRequirement": 3750,
            "isSpecial": false,
            "name": "ADR-V1 Pheromone Gene",
            "prereqs": [],
            "mults": {
                "company_rep_mult": 1.1,
                "faction_rep_mult": 1.1
            },
            "startingCost": 17500000,
            "info": "The body is genetically re-engineered so that it produces the ADR-V1 pheromone, an artificial pheromone discovered by scientists. The ADR-V1 pheromone, when excreted, triggers feelings of admiration and approval in other people.",
            "stats": "Effects:\n+10% reputation from factions and companies"
        },
        "ADR-V2 Pheromone Gene": {
            "baseCost": 550000000,
            "baseRepRequirement": 62500,
            "isSpecial": false,
            "name": "ADR-V2 Pheromone Gene",
            "prereqs": [],
            "mults": {
                "company_rep_mult": 1.2,
                "faction_rep_mult": 1.2
            },
            "startingCost": 550000000,
            "info": "The body is genetically re-engineered so that it produces the ADR-V2 pheromone, which is similar to but more potent than ADR-V1. This pheromone, when excreted, triggers feelings of admiration, approval, and respect in others.",
            "stats": "Effects:\n+20% reputation from factions and companies"
        },
        "The Shadow's Simulacrum": {
            "baseCost": 400000000,
            "baseRepRequirement": 37500,
            "isSpecial": false,
            "name": "The Shadow's Simulacrum",
            "prereqs": [],
            "mults": {
                "company_rep_mult": 1.15,
                "faction_rep_mult": 1.15
            },
            "startingCost": 400000000,
            "info": "A crude but functional matter phase-shifter module that is embedded in the brainstem and cerebellum. This augmentation was developed by criminal organizations and allows the user to project and control holographic simulacrums within a large radius. These simulacrums are commonly used for espionage and surveillance work.",
            "stats": "Effects:\n+15% reputation from factions and companies"
        },
        "Hacknet Node CPU Architecture Neural-Upload": {
            "baseCost": 11000000,
            "baseRepRequirement": 3750,
            "isSpecial": false,
            "name": "Hacknet Node CPU Architecture Neural-Upload",
            "prereqs": [],
            "mults": {
                "hacknet_node_money_mult": 1.15,
                "hacknet_node_purchase_cost_mult": 0.85
            },
            "startingCost": 11000000,
            "info": "Uploads the architecture and design details of a Hacknet Node's CPU into the brain. This allows the user to engineer custom hardware and software  for the Hacknet Node that provides better performance.",
            "stats": "Effects:\n+15% hacknet production\n-15% hacknet nodes cost"
        },
        "Hacknet Node Cache Architecture Neural-Upload": {
            "baseCost": 5500000,
            "baseRepRequirement": 2500,
            "isSpecial": false,
            "name": "Hacknet Node Cache Architecture Neural-Upload",
            "prereqs": [],
            "mults": {
                "hacknet_node_money_mult": 1.1,
                "hacknet_node_level_cost_mult": 0.85
            },
            "startingCost": 5500000,
            "info": "Uploads the architecture and design details of a Hacknet Node's main-memory cache into the brain. This allows the user to engineer custom cache hardware for the  Hacknet Node that offers better performance.",
            "stats": "Effects:\n+10% hacknet production\n-15% hacknet nodes upgrade cost"
        },
        "Hacknet Node NIC Architecture Neural-Upload": {
            "baseCost": 4500000,
            "baseRepRequirement": 1875,
            "isSpecial": false,
            "name": "Hacknet Node NIC Architecture Neural-Upload",
            "prereqs": [],
            "mults": {
                "hacknet_node_money_mult": 1.1,
                "hacknet_node_purchase_cost_mult": 0.9
            },
            "startingCost": 4500000,
            "info": "Uploads the architecture and design details of a Hacknet Node's Network Interface Card (NIC) into the brain. This allows the user to engineer a custom NIC for the Hacknet Node that offers better performance.",
            "stats": "Effects:\n+10% hacknet production\n-10% hacknet nodes cost"
        },
        "Hacknet Node Kernel Direct-Neural Interface": {
            "baseCost": 40000000,
            "baseRepRequirement": 7500,
            "isSpecial": false,
            "name": "Hacknet Node Kernel Direct-Neural Interface",
            "prereqs": [],
            "mults": {
                "hacknet_node_money_mult": 1.25
            },
            "startingCost": 40000000,
            "info": "Installs a Direct-Neural Interface jack into the arm that is capable of connecting to a Hacknet Node. This lets the user access and manipulate the Node's kernel using electrochemical signals.",
            "stats": "Effects:\n+25% hacknet production"
        },
        "Hacknet Node Core Direct-Neural Interface": {
            "baseCost": 60000000,
            "baseRepRequirement": 12500,
            "isSpecial": false,
            "name": "Hacknet Node Core Direct-Neural Interface",
            "prereqs": [],
            "mults": {
                "hacknet_node_money_mult": 1.45
            },
            "startingCost": 60000000,
            "info": "Installs a Direct-Neural Interface jack into the arm that is capable of connecting to a Hacknet Node. This lets the user access and manipulate the Node's processing logic using electrochemical signals.",
            "stats": "Effects:\n+45% hacknet production"
        },
        "NeuroFlux Governor": {
            "baseCost": 750000,
            "baseRepRequirement": 500,
            "isSpecial": false,
            "name": "NeuroFlux Governor",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.01,
                "strength_mult": 1.01,
                "defense_mult": 1.01,
                "dexterity_mult": 1.01,
                "agility_mult": 1.01,
                "charisma_mult": 1.01,
                "hacking_exp_mult": 1.01,
                "strength_exp_mult": 1.01,
                "defense_exp_mult": 1.01,
                "dexterity_exp_mult": 1.01,
                "agility_exp_mult": 1.01,
                "charisma_exp_mult": 1.01,
                "hacking_chance_mult": 1.01,
                "hacking_speed_mult": 1.01,
                "hacking_money_mult": 1.01,
                "hacking_grow_mult": 1.01,
                "company_rep_mult": 1.01,
                "faction_rep_mult": 1.01,
                "crime_money_mult": 1.01,
                "crime_success_mult": 1.01,
                "work_money_mult": 1.01,
                "hacknet_node_money_mult": 1.01,
                "hacknet_node_purchase_cost_mult": 0.99,
                "hacknet_node_ram_cost_mult": 0.99,
                "hacknet_node_core_cost_mult": 0.99,
                "hacknet_node_level_cost_mult": 0.99
            },
            "startingCost": 3750000,
            "info": "A device that is embedded in the back of the neck. The NeuroFlux Governor monitors and regulates nervous impulses coming to and from the spinal column, essentially 'governing' the body. By doing so, it improves the functionality of the body's nervous system.",
            "stats": "This special augmentation can be leveled up infinitely. Each level of this augmentation increases MOST multipliers by 1%, stacking multiplicatively."
        },
        "Neurotrainer I": {
            "baseCost": 4000000,
            "baseRepRequirement": 1000,
            "isSpecial": false,
            "name": "Neurotrainer I",
            "prereqs": [],
            "mults": {
                "hacking_exp_mult": 1.1,
                "strength_exp_mult": 1.1,
                "defense_exp_mult": 1.1,
                "dexterity_exp_mult": 1.1,
                "agility_exp_mult": 1.1,
                "charisma_exp_mult": 1.1
            },
            "startingCost": 4000000,
            "info": "A decentralized cranial implant that improves the brain's ability to learn. It is installed by releasing millions of nanobots into the human brain, each of which attaches to a different neural pathway to enhance the brain's ability to retain and retrieve information.",
            "stats": "Effects:\n+10% exp for all skills"
        },
        "Neurotrainer II": {
            "baseCost": 45000000,
            "baseRepRequirement": 10000,
            "isSpecial": false,
            "name": "Neurotrainer II",
            "prereqs": [],
            "mults": {
                "hacking_exp_mult": 1.15,
                "strength_exp_mult": 1.15,
                "defense_exp_mult": 1.15,
                "dexterity_exp_mult": 1.15,
                "agility_exp_mult": 1.15,
                "charisma_exp_mult": 1.15
            },
            "startingCost": 45000000,
            "info": "A decentralized cranial implant that improves the brain's ability to learn. This is a more powerful version of the Neurotrainer I augmentation, but it does not require Neurotrainer I to be installed as a prerequisite.",
            "stats": "Effects:\n+15% exp for all skills"
        },
        "Neurotrainer III": {
            "baseCost": 130000000,
            "baseRepRequirement": 25000,
            "isSpecial": false,
            "name": "Neurotrainer III",
            "prereqs": [],
            "mults": {
                "hacking_exp_mult": 1.2,
                "strength_exp_mult": 1.2,
                "defense_exp_mult": 1.2,
                "dexterity_exp_mult": 1.2,
                "agility_exp_mult": 1.2,
                "charisma_exp_mult": 1.2
            },
            "startingCost": 130000000,
            "info": "A decentralized cranial implant that improves the brain's ability to learn. This is a more powerful version of the Neurotrainer I and Neurotrainer II augmentation, but it does not require either of them to be installed as a prerequisite.",
            "stats": "Effects:\n+20% exp for all skills"
        },
        "HyperSight Corneal Implant": {
            "baseCost": 2750000000,
            "baseRepRequirement": 150000,
            "isSpecial": false,
            "name": "HyperSight Corneal Implant",
            "prereqs": [],
            "mults": {
                "dexterity_mult": 1.4,
                "hacking_speed_mult": 1.03,
                "hacking_money_mult": 1.1
            },
            "startingCost": 2750000000,
            "info": "A bionic eye implant that grants sight capabilities far beyond those of a natural human. Embedded circuitry within the implant provides the ability to detect heat and movement through solid objects such as walls, thus providing 'x-ray vision'-like capabilities.",
            "stats": "Effects:\n+40% dexterity skill\n+3% faster hack(), grow(), and weaken()\n+10% hack() power"
        },
        "LuminCloaking-V1 Skin Implant": {
            "baseCost": 5000000,
            "baseRepRequirement": 1500,
            "isSpecial": false,
            "name": "LuminCloaking-V1 Skin Implant",
            "prereqs": [],
            "mults": {
                "agility_mult": 1.05,
                "crime_money_mult": 1.1
            },
            "startingCost": 5000000,
            "info": "A skin implant that reinforces the skin with highly-advanced synthetic cells. These cells, when powered, have a negative refractive index. As a result, they bend light around the skin, making the user much harder to see to the naked eye.",
            "stats": "Effects:\n+5% agility skill\n+10% crime money"
        },
        "LuminCloaking-V2 Skin Implant": {
            "baseCost": 30000000,
            "baseRepRequirement": 5000,
            "isSpecial": false,
            "name": "LuminCloaking-V2 Skin Implant",
            "prereqs": [
                "LuminCloaking-V1 Skin Implant"
            ],
            "mults": {
                "defense_mult": 1.1,
                "agility_mult": 1.1,
                "crime_money_mult": 1.25
            },
            "startingCost": 30000000,
            "info": "This is a more advanced version of the LuminCloaking-V1 augmentation. This skin implant reinforces the skin with highly-advanced synthetic cells. These cells, when powered, are capable of not only bending light but also of bending heat, making the user more resilient as well as stealthy.",
            "stats": "Effects:\n+10% defense skill\n+10% agility skill\n+25% crime money"
        },
        "SmartSonar Implant": {
            "baseCost": 75000000,
            "baseRepRequirement": 22500,
            "isSpecial": false,
            "name": "SmartSonar Implant",
            "prereqs": [],
            "mults": {
                "dexterity_mult": 1.1,
                "dexterity_exp_mult": 1.15,
                "crime_money_mult": 1.25
            },
            "startingCost": 75000000,
            "info": "A cochlear implant that helps the player detect and locate enemies using sound propagation.",
            "stats": "Effects:\n+10% dexterity skill\n+15% dexterity exp\n+25% crime money"
        },
        "Power Recirculation Core": {
            "baseCost": 180000000,
            "baseRepRequirement": 25000,
            "isSpecial": false,
            "name": "Power Recirculation Core",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.05,
                "strength_mult": 1.05,
                "defense_mult": 1.05,
                "dexterity_mult": 1.05,
                "agility_mult": 1.05,
                "charisma_mult": 1.05,
                "hacking_exp_mult": 1.1,
                "strength_exp_mult": 1.1,
                "defense_exp_mult": 1.1,
                "dexterity_exp_mult": 1.1,
                "agility_exp_mult": 1.1,
                "charisma_exp_mult": 1.1
            },
            "startingCost": 180000000,
            "info": "The body's nerves are attached with polypyrrole nanocircuits that are capable of capturing wasted energy, in the form of heat, and converting it back into usable power.",
            "stats": "Effects:\n+5% all skills\n+10% exp for all skills"
        },
        "QLink": {
            "baseCost": 25000000000000,
            "baseRepRequirement": 1875000,
            "isSpecial": false,
            "name": "QLink",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.75,
                "hacking_chance_mult": 2.5,
                "hacking_speed_mult": 2,
                "hacking_money_mult": 4
            },
            "startingCost": 25000000000000,
            "info": "A brain implant that wirelessly connects you to the Illuminati's quantum supercomputer, allowing you to access and use its incredible computing power.",
            "stats": "Effects:\n+75% hacking skill\n+100% faster hack(), grow(), and weaken()\n+150% hack() success chance\n+300% hack() power"
        },
        "The Red Pill": {
            "baseCost": 0,
            "baseRepRequirement": 2500000,
            "isSpecial": false,
            "name": "The Red Pill",
            "prereqs": [],
            "mults": {},
            "startingCost": 0,
            "info": "It's time to leave the cave.",
            "stats": null
        },
        "SPTN-97 Gene Modification": {
            "baseCost": 4875000000,
            "baseRepRequirement": 1250000,
            "isSpecial": false,
            "name": "SPTN-97 Gene Modification",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.15,
                "strength_mult": 1.75,
                "defense_mult": 1.75,
                "dexterity_mult": 1.75,
                "agility_mult": 1.75
            },
            "startingCost": 4875000000,
            "info": "The SPTN-97 gene is injected into the genome. The SPTN-97 gene is an artificially-synthesized gene that was developed by DARPA to create super-soldiers through genetic modification. The gene was outlawed in 2056.",
            "stats": "Effects:\n+15% hacking skill\n+75% combat skills"
        },
        "ECorp HVMind Implant": {
            "baseCost": 5500000000,
            "baseRepRequirement": 1500000,
            "isSpecial": false,
            "name": "ECorp HVMind Implant",
            "prereqs": [],
            "mults": {
                "hacking_grow_mult": 3
            },
            "startingCost": 5500000000,
            "info": "A brain implant developed by ECorp. They do not reveal what exactly the implant does, but they promise that it will greatly enhance your abilities.",
            "stats": null
        },
        "CordiARC Fusion Reactor": {
            "baseCost": 5000000000,
            "baseRepRequirement": 1125000,
            "isSpecial": false,
            "name": "CordiARC Fusion Reactor",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.35,
                "defense_mult": 1.35,
                "dexterity_mult": 1.35,
                "agility_mult": 1.35,
                "strength_exp_mult": 1.35,
                "defense_exp_mult": 1.35,
                "dexterity_exp_mult": 1.35,
                "agility_exp_mult": 1.35
            },
            "startingCost": 5000000000,
            "info": "The thoracic cavity is equipped with a small chamber designed to hold and sustain hydrogen plasma. The plasma is used to generate fusion power through nuclear fusion, providing limitless amounts of clean energy for the body.",
            "stats": "Effects:\n+35% combat skills\n+35% combat exp"
        },
        "SmartJaw": {
            "baseCost": 2750000000,
            "baseRepRequirement": 375000,
            "isSpecial": false,
            "name": "SmartJaw",
            "prereqs": [],
            "mults": {
                "charisma_mult": 1.5,
                "charisma_exp_mult": 1.5,
                "company_rep_mult": 1.25,
                "faction_rep_mult": 1.25
            },
            "startingCost": 2750000000,
            "info": "A bionic jaw that contains advanced hardware and software capable of psychoanalyzing and profiling the personality of others using optical imaging software.",
            "stats": "Effects:\n+50% Charisma skill\n+50% charisma exp\n+25% reputation from factions and companies"
        },
        "Neotra": {
            "baseCost": 2875000000,
            "baseRepRequirement": 562500,
            "isSpecial": false,
            "name": "Neotra",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.55,
                "defense_mult": 1.55
            },
            "startingCost": 2875000000,
            "info": "A highly-advanced techno-organic drug that is injected into the skeletal and integumentary system. The drug permanently modifies the DNA of the body's skin and bone cells, granting them the ability to repair and restructure themselves.",
            "stats": "Effects:\n+55% strength skill\n+55% defense skill"
        },
        "Xanipher": {
            "baseCost": 4250000000,
            "baseRepRequirement": 875000,
            "isSpecial": false,
            "name": "Xanipher",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.2,
                "strength_mult": 1.2,
                "defense_mult": 1.2,
                "dexterity_mult": 1.2,
                "agility_mult": 1.2,
                "charisma_mult": 1.2,
                "hacking_exp_mult": 1.15,
                "strength_exp_mult": 1.15,
                "defense_exp_mult": 1.15,
                "dexterity_exp_mult": 1.15,
                "agility_exp_mult": 1.15,
                "charisma_exp_mult": 1.15
            },
            "startingCost": 4250000000,
            "info": "A concoction of advanced nanobots that is orally ingested into the body. These nanobots induce physiological changes and significantly improve the body's functioning in all aspects.",
            "stats": "Effects:\n+20% all skills\n+15% exp for all skills"
        },
        "Hydroflame Left Arm": {
            "baseCost": 2500000000000,
            "baseRepRequirement": 1250000,
            "isSpecial": false,
            "name": "Hydroflame Left Arm",
            "prereqs": [],
            "mults": {
                "strength_mult": 2.7
            },
            "startingCost": 2500000000000,
            "info": "The left arm of a legendary BitRunner who ascended beyond this world. It projects a light blue energy shield that protects the exposed inner parts. Even though it contains no weapons, the advanced tungsten titanium alloy increases the users strength to unbelievable levels. The augmentation gets more powerful over time for seemingly no reason.",
            "stats": "Effects:\n+170% strength skill"
        },
        "nextSENS Gene Modification": {
            "baseCost": 1925000000,
            "baseRepRequirement": 437500,
            "isSpecial": false,
            "name": "nextSENS Gene Modification",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.2,
                "strength_mult": 1.2,
                "defense_mult": 1.2,
                "dexterity_mult": 1.2,
                "agility_mult": 1.2,
                "charisma_mult": 1.2
            },
            "startingCost": 1925000000,
            "info": "The body is genetically re-engineered to maintain a state of negligible senescence, preventing the body from deteriorating with age.",
            "stats": "Effects:\n+20% all skills"
        },
        "OmniTek InfoLoad": {
            "baseCost": 2875000000,
            "baseRepRequirement": 625000,
            "isSpecial": false,
            "name": "OmniTek InfoLoad",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.2,
                "hacking_exp_mult": 1.25
            },
            "startingCost": 2875000000,
            "info": "OmniTek's data and information repository is uploaded into your brain, enhancing your programming and hacking abilities.",
            "stats": "Effects:\n+20% hacking skill\n+25% hacking exp"
        },
        "Photosynthetic Cells": {
            "baseCost": 2750000000,
            "baseRepRequirement": 562500,
            "isSpecial": false,
            "name": "Photosynthetic Cells",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.4,
                "defense_mult": 1.4,
                "agility_mult": 1.4
            },
            "startingCost": 2750000000,
            "info": "Chloroplasts are added to epidermal stem cells and are applied to the body using a skin graft. The result is photosynthetic skin cells, allowing users to generate their own energy and nutrition using solar power.",
            "stats": "Effects:\n+40% strength skill\n+40% defense skill\n+40% agility skill"
        },
        "BitRunners Neurolink": {
            "baseCost": 4375000000,
            "baseRepRequirement": 875000,
            "isSpecial": false,
            "name": "BitRunners Neurolink",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.15,
                "hacking_exp_mult": 1.2,
                "hacking_chance_mult": 1.1,
                "hacking_speed_mult": 1.05
            },
            "startingCost": 4375000000,
            "info": "A brain implant that provides a high-bandwidth, direct neural link between your mind and the BitRunners' data servers, which reportedly contain the largest database of hacking tools and information in the world.",
            "stats": "Effects:\n+15% hacking skill\n+20% hacking exp\n+5% faster hack(), grow(), and weaken()\n+10% hack() success chance\nStart with FTPCrack.exe and relaySMTP.exe after installing Augmentations."
        },
        "The Black Hand": {
            "baseCost": 550000000,
            "baseRepRequirement": 100000,
            "isSpecial": false,
            "name": "The Black Hand",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.1,
                "strength_mult": 1.15,
                "dexterity_mult": 1.15,
                "hacking_speed_mult": 1.02,
                "hacking_money_mult": 1.1
            },
            "startingCost": 550000000,
            "info": "A highly advanced bionic hand. This prosthetic not only enhances strength and dexterity but it is also embedded with hardware and firmware that lets the user connect to, access, and hack devices and machines by just touching them.",
            "stats": "Effects:\n+10% hacking skill\n+15% strength skill\n+15% dexterity skill\n+2% faster hack(), grow(), and weaken()\n+10% hack() power"
        },
        "CRTX42-AA Gene Modification": {
            "baseCost": 225000000,
            "baseRepRequirement": 45000,
            "isSpecial": false,
            "name": "CRTX42-AA Gene Modification",
            "prereqs": [],
            "mults": {
                "hacking_mult": 1.08,
                "hacking_exp_mult": 1.15
            },
            "startingCost": 225000000,
            "info": "The CRTX42-AA gene is injected into the genome. The CRTX42-AA is an artificially-synthesized gene that targets the visual and prefrontal cortex and improves cognitive abilities.",
            "stats": "Effects:\n+8% hacking skill\n+15% hacking exp"
        },
        "Neuregen Gene Modification": {
            "baseCost": 375000000,
            "baseRepRequirement": 37500,
            "isSpecial": false,
            "name": "Neuregen Gene Modification",
            "prereqs": [],
            "mults": {
                "hacking_exp_mult": 1.4
            },
            "startingCost": 375000000,
            "info": "A drug that genetically modifies the neurons in the brain resulting in neurons that never die, continuously regenerate, and strengthen themselves.",
            "stats": "Effects:\n+40% hacking exp"
        },
        "CashRoot Starter Kit": {
            "baseCost": 125000000,
            "baseRepRequirement": 12500,
            "isSpecial": false,
            "name": "CashRoot Starter Kit",
            "prereqs": [],
            "mults": {},
            "startingCost": 125000000,
            "info": "A collection of digital assets saved on a small chip. The chip is implanted into your wrist. A small jack in the chip allows you to connect it to a computer and upload the assets.",
            "stats": "Effects:\nStart with $1000000 after installing Augmentations.\nStart with BruteSSH.exe after installing Augmentations."
        },
        "NutriGen Implant": {
            "baseCost": 2500000,
            "baseRepRequirement": 6250,
            "isSpecial": false,
            "name": "NutriGen Implant",
            "prereqs": [],
            "mults": {
                "strength_exp_mult": 1.2,
                "defense_exp_mult": 1.2,
                "dexterity_exp_mult": 1.2,
                "agility_exp_mult": 1.2
            },
            "startingCost": 2500000,
            "info": "A thermo-powered artificial nutrition generator. Endogenously synthesizes glucose, amino acids, and vitamins and redistributes them across the body. The device is powered by the body's naturally wasted energy in the form of heat.",
            "stats": "Effects:\n+20% combat exp"
        },
        "PCMatrix": {
            "baseCost": 2000000000,
            "baseRepRequirement": 100000,
            "isSpecial": false,
            "name": "PCMatrix",
            "prereqs": [],
            "mults": {
                "charisma_mult": 1.0777,
                "charisma_exp_mult": 1.0777,
                "company_rep_mult": 1.0777,
                "faction_rep_mult": 1.0777,
                "crime_money_mult": 1.0777,
                "crime_success_mult": 1.0777,
                "work_money_mult": 1.777
            },
            "startingCost": 2000000000,
            "info": "A 'Probability Computation Matrix' is installed in the frontal cortex. This implant uses advanced mathematical algorithims to rapidly identify and compute statistical outcomes of nearly every situation.",
            "stats": "Effects:\n+7.77% Charisma skill\n+7.77% charisma exp\n+7.77% reputation from factions and companies\n+7.77% crime money\n+7.77% crime success rate\n+77.7% work money\nStart with DeepscanV1.exe and AutoLink.exe after installing Augmentations."
        },
        "INFRARET Enhancement": {
            "baseCost": 30000000,
            "baseRepRequirement": 7500,
            "isSpecial": false,
            "name": "INFRARET Enhancement",
            "prereqs": [],
            "mults": {
                "dexterity_mult": 1.1,
                "crime_money_mult": 1.1,
                "crime_success_mult": 1.25
            },
            "startingCost": 30000000,
            "info": "A tiny chip that sits behind the retinae. This implant lets the user visually detect infrared radiation.",
            "stats": "Effects:\n+10% dexterity skill\n+10% crime money\n+25% crime success rate"
        },
        "DermaForce Particle Barrier": {
            "baseCost": 50000000,
            "baseRepRequirement": 15000,
            "isSpecial": false,
            "name": "DermaForce Particle Barrier",
            "prereqs": [],
            "mults": {
                "defense_mult": 1.4
            },
            "startingCost": 50000000,
            "info": "Synthetic skin that is grafted onto the body. This skin consists of millions of nanobots capable of projecting high-density muon beams, creating an energy barrier around the user.",
            "stats": "Effects:\n+40% defense skill"
        },
        "Graphene BrachiBlades Upgrade": {
            "baseCost": 2500000000,
            "baseRepRequirement": 225000,
            "isSpecial": false,
            "name": "Graphene BrachiBlades Upgrade",
            "prereqs": [
                "BrachiBlades"
            ],
            "mults": {
                "strength_mult": 1.4,
                "defense_mult": 1.4,
                "crime_money_mult": 1.3,
                "crime_success_mult": 1.1
            },
            "startingCost": 2500000000,
            "info": "An upgrade to the BrachiBlades augmentation. It infuses the retractable blades with an advanced graphene material making them stronger and lighter.",
            "stats": "Effects:\n+40% strength skill\n+40% defense skill\n+30% crime money\n+10% crime success rate"
        },
        "Graphene Bionic Arms Upgrade": {
            "baseCost": 3750000000,
            "baseRepRequirement": 500000,
            "isSpecial": false,
            "name": "Graphene Bionic Arms Upgrade",
            "prereqs": [
                "Bionic Arms"
            ],
            "mults": {
                "strength_mult": 1.85,
                "dexterity_mult": 1.85
            },
            "startingCost": 3750000000,
            "info": "An upgrade to the Bionic Arms augmentation. It infuses the prosthetic arms with an advanced graphene material to make them stronger and lighter.",
            "stats": "Effects:\n+85% strength skill\n+85% dexterity skill"
        },
        "BrachiBlades": {
            "baseCost": 90000000,
            "baseRepRequirement": 12500,
            "isSpecial": false,
            "name": "BrachiBlades",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.15,
                "defense_mult": 1.15,
                "crime_money_mult": 1.15,
                "crime_success_mult": 1.1
            },
            "startingCost": 90000000,
            "info": "A set of retractable plasteel blades that are implanted in the arm, underneath the skin.",
            "stats": "Effects:\n+15% strength skill\n+15% defense skill\n+15% crime money\n+10% crime success rate"
        },
        "Bionic Arms": {
            "baseCost": 275000000,
            "baseRepRequirement": 62500,
            "isSpecial": false,
            "name": "Bionic Arms",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.3,
                "dexterity_mult": 1.3
            },
            "startingCost": 275000000,
            "info": "Cybernetic arms created from plasteel and carbon fibers that completely replace the user's organic arms.",
            "stats": "Effects:\n+30% strength skill\n+30% dexterity skill"
        },
        "Social Negotiation Assistant (S.N.A)": {
            "baseCost": 30000000,
            "baseRepRequirement": 6250,
            "isSpecial": false,
            "name": "Social Negotiation Assistant (S.N.A)",
            "prereqs": [],
            "mults": {
                "company_rep_mult": 1.15,
                "faction_rep_mult": 1.15,
                "work_money_mult": 1.1
            },
            "startingCost": 30000000,
            "info": "A cranial implant that affects the user's personality, making them better at negotiation in social situations.",
            "stats": "Effects:\n+15% reputation from factions and companies\n+10% work money"
        },
        "Neuroreceptor Management Implant": {
            "baseCost": 550000000,
            "baseRepRequirement": 75000,
            "isSpecial": false,
            "name": "Neuroreceptor Management Implant",
            "prereqs": [],
            "mults": {},
            "startingCost": 550000000,
            "info": "A brain implant carefully assembled around the synapses, which micromanages the activity and levels of various neuroreceptor chemicals and modulates electrical acvitiy to optimize concentration, allowing the user to multitask much more effectively.",
            "stats": "This augmentation removes the penalty for not focusing on actions such as working in a job or working for a faction."
        },
        "EsperTech Bladeburner Eyewear": {
            "baseCost": 165000000,
            "baseRepRequirement": 1250,
            "isSpecial": true,
            "name": "EsperTech Bladeburner Eyewear",
            "prereqs": [],
            "mults": {
                "dexterity_mult": 1.05,
                "bladeburner_success_chance_mult": 1.03
            },
            "startingCost": 165000000,
            "info": "Ballistic-grade protective and retractable eyewear that was designed specifically for Bladeburner units. This is implanted by installing a mechanical frame in the skull's orbit. This frame interfaces with the brain and allows the user to automatically extrude and extract the eyewear. The eyewear protects against debris, shrapnel, lasers, blinding flashes, and gas. It is also embedded with a data processing chip that can be programmed to display an AR HUD to assist the user in field missions.",
            "stats": "Effects:\n+5% dexterity skill\n+3% Bladeburner Contracts and Operations success chance"
        },
        "EMS-4 Recombination": {
            "baseCost": 275000000,
            "baseRepRequirement": 2500,
            "isSpecial": true,
            "name": "EMS-4 Recombination",
            "prereqs": [],
            "mults": {
                "bladeburner_stamina_gain_mult": 1.02,
                "bladeburner_analysis_mult": 1.05,
                "bladeburner_success_chance_mult": 1.03
            },
            "startingCost": 275000000,
            "info": "A DNA recombination of the EMS-4 Gene. This genetic engineering technique was originally used on Bladeburners during the Synthoid uprising to induce wakefulness and concentration, suppress fear, reduce empathy, improve reflexes, and improve memory among other things.",
            "stats": "Effects:\n+2% Bladeburner Stamina gain\n+5% Bladeburner Field Analysis effectiveness\n+3% Bladeburner Contracts and Operations success chance"
        },
        "ORION-MKIV Shoulder": {
            "baseCost": 550000000,
            "baseRepRequirement": 6250,
            "isSpecial": true,
            "name": "ORION-MKIV Shoulder",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.05,
                "defense_mult": 1.05,
                "dexterity_mult": 1.05,
                "bladeburner_success_chance_mult": 1.04
            },
            "startingCost": 550000000,
            "info": "A bionic shoulder augmentation for the right shoulder. Using cybernetics, the ORION-MKIV shoulder enhances the strength and dexterity of the user's right arm. It also provides protection due to its crystallized graphene plating.",
            "stats": "Effects:\n+5% strength skill\n+5% defense skill\n+5% dexterity skill\n+4% Bladeburner Contracts and Operations success chance"
        },
        "Hyperion Plasma Cannon V1": {
            "baseCost": 2750000000,
            "baseRepRequirement": 12500,
            "isSpecial": true,
            "name": "Hyperion Plasma Cannon V1",
            "prereqs": [],
            "mults": {
                "bladeburner_success_chance_mult": 1.06
            },
            "startingCost": 2750000000,
            "info": "A pair of mini plasma cannons embedded into the hands. The Hyperion is capable of rapidly firing bolts of high-density plasma. The weapon is meant to be used against augmented enemies as the ionized nature of the plasma disrupts the electrical systems of Augmentations. However, it can also be effective against non-augmented enemies due to its high temperature and concussive force.",
            "stats": "Effects:\n+6% Bladeburner Contracts and Operations success chance"
        },
        "Hyperion Plasma Cannon V2": {
            "baseCost": 5500000000,
            "baseRepRequirement": 25000,
            "isSpecial": true,
            "name": "Hyperion Plasma Cannon V2",
            "prereqs": [
                "Hyperion Plasma Cannon V1"
            ],
            "mults": {
                "bladeburner_success_chance_mult": 1.08
            },
            "startingCost": 5500000000,
            "info": "A pair of mini plasma cannons embedded into the hands. This augmentation is more advanced and powerful than the original V1 model. This V2 model is more power-efficient, more accurate, and can fire plasma bolts at a much higher velocity than the V1 model.",
            "stats": "Effects:\n+8% Bladeburner Contracts and Operations success chance"
        },
        "GOLEM Serum": {
            "baseCost": 11000000000,
            "baseRepRequirement": 31250,
            "isSpecial": true,
            "name": "GOLEM Serum",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.07,
                "defense_mult": 1.07,
                "dexterity_mult": 1.07,
                "agility_mult": 1.07,
                "bladeburner_stamina_gain_mult": 1.05
            },
            "startingCost": 11000000000,
            "info": "A serum that permanently enhances many aspects of human capabilities, including strength, speed, immune system enhancements, and mitochondrial efficiency. The serum was originally developed by the Chinese military in an attempt to create super soldiers.",
            "stats": "Effects:\n+7% combat skills\n+5% Bladeburner Stamina gain"
        },
        "Vangelis Virus": {
            "baseCost": 2750000000,
            "baseRepRequirement": 18750,
            "isSpecial": true,
            "name": "Vangelis Virus",
            "prereqs": [],
            "mults": {
                "dexterity_exp_mult": 1.1,
                "bladeburner_analysis_mult": 1.1,
                "bladeburner_success_chance_mult": 1.04
            },
            "startingCost": 2750000000,
            "info": "A synthetic symbiotic virus that is injected into human brain tissue. The Vangelis virus heightens the senses and focus of its host, and also enhances its intuition.",
            "stats": "Effects:\n+10% dexterity exp\n+10% Bladeburner Field Analysis effectiveness\n+4% Bladeburner Contracts and Operations success chance"
        },
        "Vangelis Virus 3.0": {
            "baseCost": 11000000000,
            "baseRepRequirement": 37500,
            "isSpecial": true,
            "name": "Vangelis Virus 3.0",
            "prereqs": [
                "Vangelis Virus"
            ],
            "mults": {
                "defense_exp_mult": 1.1,
                "dexterity_exp_mult": 1.1,
                "bladeburner_analysis_mult": 1.15,
                "bladeburner_success_chance_mult": 1.05
            },
            "startingCost": 11000000000,
            "info": "An improved version of Vangelis, a synthetic symbiotic virus that is injected into human brain tissue. On top of the benefits of the original virus, this also grants an accelerated healing factor and enhanced reflexes.",
            "stats": "Effects:\n+10% defense exp\n+10% dexterity exp\n+15% Bladeburner Field Analysis effectiveness\n+5% Bladeburner Contracts and Operations success chance"
        },
        "I.N.T.E.R.L.I.N.K.E.D": {
            "baseCost": 5500000000,
            "baseRepRequirement": 25000,
            "isSpecial": true,
            "name": "I.N.T.E.R.L.I.N.K.E.D",
            "prereqs": [],
            "mults": {
                "strength_exp_mult": 1.05,
                "defense_exp_mult": 1.05,
                "dexterity_exp_mult": 1.05,
                "agility_exp_mult": 1.05,
                "bladeburner_max_stamina_mult": 1.1
            },
            "startingCost": 5500000000,
            "info": "The DNA is genetically modified to enhance the human's body extracellular matrix (ECM). This improves the ECM's ability to structurally support the body and grants heightened strength and durability.",
            "stats": "Effects:\n+5% combat exp\n+10% Bladeburner Max Stamina"
        },
        "Blade's Runners": {
            "baseCost": 8250000000,
            "baseRepRequirement": 20000,
            "isSpecial": true,
            "name": "Blade's Runners",
            "prereqs": [],
            "mults": {
                "agility_mult": 1.05,
                "bladeburner_max_stamina_mult": 1.05,
                "bladeburner_stamina_gain_mult": 1.05
            },
            "startingCost": 8250000000,
            "info": "A cybernetic foot augmentation that was specifically created for Bladeburners during the Synthoid Uprising. The organic musculature of the human foot is enhanced with flexible carbon nanotube matrices that are controlled by intelligent servo-motors.",
            "stats": "Effects:\n+5% agility skill\n+5% Bladeburner Max Stamina\n+5% Bladeburner Stamina gain"
        },
        "BLADE-51b Tesla Armor": {
            "baseCost": 1375000000,
            "baseRepRequirement": 12500,
            "isSpecial": true,
            "name": "BLADE-51b Tesla Armor",
            "prereqs": [],
            "mults": {
                "strength_mult": 1.04,
                "defense_mult": 1.04,
                "dexterity_mult": 1.04,
                "agility_mult": 1.04,
                "bladeburner_stamina_gain_mult": 1.02,
                "bladeburner_success_chance_mult": 1.03
            },
            "startingCost": 1375000000,
            "info": "A powered exoskeleton suit designed as armor for Bladeburner units. This exoskeleton is incredibly adaptable and can protect the wearer from blunt, piercing, concussive, thermal, chemical, and electric trauma. It also enhances the user's physical abilities.",
            "stats": "Effects:\n+4% combat skills\n+2% Bladeburner Stamina gain\n+3% Bladeburner Contracts and Operations success chance"
        },
        "BLADE-51b Tesla Armor: Power Cells Upgrade": {
            "baseCost": 2750000000,
            "baseRepRequirement": 18750,
            "isSpecial": true,
            "name": "BLADE-51b Tesla Armor: Power Cells Upgrade",
            "prereqs": [
                "BLADE-51b Tesla Armor"
            ],
            "mults": {
                "bladeburner_max_stamina_mult": 1.05,
                "bladeburner_stamina_gain_mult": 1.02,
                "bladeburner_success_chance_mult": 1.05
            },
            "startingCost": 2750000000,
            "info": "Upgrades the BLADE-51b Tesla Armor with Ion Power Cells, which are capable of more efficiently storing and using power.",
            "stats": "Effects:\n+5% Bladeburner Max Stamina\n+2% Bladeburner Stamina gain\n+5% Bladeburner Contracts and Operations success chance"
        },
        "BLADE-51b Tesla Armor: Energy Shielding Upgrade": {
            "baseCost": 5500000000,
            "baseRepRequirement": 21250,
            "isSpecial": true,
            "name": "BLADE-51b Tesla Armor: Energy Shielding Upgrade",
            "prereqs": [
                "BLADE-51b Tesla Armor"
            ],
            "mults": {
                "defense_mult": 1.05,
                "bladeburner_success_chance_mult": 1.06
            },
            "startingCost": 5500000000,
            "info": "Upgrades the BLADE-51b Tesla Armor with a plasma energy propulsion system that is capable of projecting an energy shielding force field.",
            "stats": "Effects:\n+5% defense skill\n+6% Bladeburner Contracts and Operations success chance"
        },
        "BLADE-51b Tesla Armor: Unibeam Upgrade": {
            "baseCost": 16500000000,
            "baseRepRequirement": 31250,
            "isSpecial": true,
            "name": "BLADE-51b Tesla Armor: Unibeam Upgrade",
            "prereqs": [
                "BLADE-51b Tesla Armor"
            ],
            "mults": {
                "bladeburner_success_chance_mult": 1.08
            },
            "startingCost": 16500000000,
            "info": "Upgrades the BLADE-51b Tesla Armor with a concentrated deuterium-fluoride laser weapon. It's precision and accuracy makes it useful for quickly neutralizing threats while keeping casualties to a minimum.",
            "stats": "Effects:\n+8% Bladeburner Contracts and Operations success chance"
        },
        "BLADE-51b Tesla Armor: Omnibeam Upgrade": {
            "baseCost": 27500000000,
            "baseRepRequirement": 62500,
            "isSpecial": true,
            "name": "BLADE-51b Tesla Armor: Omnibeam Upgrade",
            "prereqs": [
                "BLADE-51b Tesla Armor: Unibeam Upgrade"
            ],
            "mults": {
                "bladeburner_success_chance_mult": 1.1
            },
            "startingCost": 27500000000,
            "info": "Upgrades the BLADE-51b Tesla Armor Unibeam augmentation to use a multiple-fiber system. This upgraded weapon uses multiple fiber laser modules that combine together to form a single, more powerful beam of up to 2000MW.",
            "stats": "Effects:\n+10% Bladeburner Contracts and Operations success chance"
        },
        "BLADE-51b Tesla Armor: IPU Upgrade": {
            "baseCost": 1100000000,
            "baseRepRequirement": 15000,
            "isSpecial": true,
            "name": "BLADE-51b Tesla Armor: IPU Upgrade",
            "prereqs": [
                "BLADE-51b Tesla Armor"
            ],
            "mults": {
                "bladeburner_analysis_mult": 1.15,
                "bladeburner_success_chance_mult": 1.02
            },
            "startingCost": 1100000000,
            "info": "Upgrades the BLADE-51b Tesla Armor with an AI Information Processing Unit that was specially designed to analyze Synthoid related data and information.",
            "stats": "Effects:\n+15% Bladeburner Field Analysis effectiveness\n+2% Bladeburner Contracts and Operations success chance"
        },
        "The Blade's Simulacrum": {
            "baseCost": 150000000000,
            "baseRepRequirement": 1250,
            "isSpecial": true,
            "name": "The Blade's Simulacrum",
            "prereqs": [],
            "mults": {},
            "startingCost": 150000000000,
            "info": "A highly-advanced matter phase-shifter module that is embedded in the brainstem and cerebellum. This augmentation allows the user to project and control a holographic simulacrum within an extremely large radius. These specially-modified holograms were specifically weaponized by Bladeburner units to be used against Synthoids.",
            "stats": "This augmentation allows you to perform Bladeburner actions and other actions (such as working, commiting crimes, etc.) at the same time."
        },
        "Stanek's Gift - Genesis": {
            "baseCost": 0,
            "baseRepRequirement": 0,
            "isSpecial": true,
            "name": "Stanek's Gift - Genesis",
            "prereqs": [],
            "mults": {
                "hacking_mult": 0.9,
                "strength_mult": 0.9,
                "defense_mult": 0.9,
                "dexterity_mult": 0.9,
                "agility_mult": 0.9,
                "charisma_mult": 0.9,
                "hacking_exp_mult": 0.9,
                "strength_exp_mult": 0.9,
                "defense_exp_mult": 0.9,
                "dexterity_exp_mult": 0.9,
                "agility_exp_mult": 0.9,
                "charisma_exp_mult": 0.9,
                "hacking_chance_mult": 0.9,
                "hacking_speed_mult": 0.9,
                "hacking_money_mult": 0.9,
                "hacking_grow_mult": 0.9,
                "company_rep_mult": 0.9,
                "faction_rep_mult": 0.9,
                "crime_money_mult": 0.9,
                "crime_success_mult": 0.9,
                "work_money_mult": 0.9,
                "hacknet_node_money_mult": 0.9,
                "hacknet_node_purchase_cost_mult": 1.1,
                "hacknet_node_ram_cost_mult": 1.1,
                "hacknet_node_core_cost_mult": 1.1,
                "hacknet_node_level_cost_mult": 1.1
            },
            "startingCost": 0,
            "info": "Allison \"Mother\" Stanek imparts you with her gift. An experimental Augmentation implanted at the base of the neck. It allows you to overclock your entire system by carefully changing the configuration.",
            "stats": "Its unstable nature decreases all your stats by 10%"
        },
        "Stanek's Gift - Awakening": {
            "baseCost": 0,
            "baseRepRequirement": 1000000,
            "isSpecial": true,
            "name": "Stanek's Gift - Awakening",
            "prereqs": [
                "Stanek's Gift - Genesis"
            ],
            "mults": {
                "hacking_mult": 1.0555555555555556,
                "strength_mult": 1.0555555555555556,
                "defense_mult": 1.0555555555555556,
                "dexterity_mult": 1.0555555555555556,
                "agility_mult": 1.0555555555555556,
                "charisma_mult": 1.0555555555555556,
                "hacking_exp_mult": 1.0555555555555556,
                "strength_exp_mult": 1.0555555555555556,
                "defense_exp_mult": 1.0555555555555556,
                "dexterity_exp_mult": 1.0555555555555556,
                "agility_exp_mult": 1.0555555555555556,
                "charisma_exp_mult": 1.0555555555555556,
                "hacking_chance_mult": 1.0555555555555556,
                "hacking_speed_mult": 1.0555555555555556,
                "hacking_money_mult": 1.0555555555555556,
                "hacking_grow_mult": 1.0555555555555556,
                "company_rep_mult": 1.0555555555555556,
                "faction_rep_mult": 1.0555555555555556,
                "crime_money_mult": 1.0555555555555556,
                "crime_success_mult": 1.0555555555555556,
                "work_money_mult": 1.0555555555555556,
                "hacknet_node_money_mult": 1.0555555555555556,
                "hacknet_node_purchase_cost_mult": 0.9545454545454545,
                "hacknet_node_ram_cost_mult": 0.9545454545454545,
                "hacknet_node_core_cost_mult": 0.9545454545454545,
                "hacknet_node_level_cost_mult": 0.9545454545454545
            },
            "startingCost": 0,
            "info": "The next evolution is near, a coming together of man and machine. A synthesis greater than the birth of the human organism. Time spent with the gift has allowed for acclimatization of the invasive augment and the toll it takes upon your frame granting lesser penalty of 5% to all stats.",
            "stats": "The penalty for the gift is reduced to 5%"
        },
        "Stanek's Gift - Serenity": {
            "baseCost": 0,
            "baseRepRequirement": 100000000,
            "isSpecial": true,
            "name": "Stanek's Gift - Serenity",
            "prereqs": [
                "Stanek's Gift - Awakening"
            ],
            "mults": {
                "hacking_mult": 1.0526315789473684,
                "strength_mult": 1.0526315789473684,
                "defense_mult": 1.0526315789473684,
                "dexterity_mult": 1.0526315789473684,
                "agility_mult": 1.0526315789473684,
                "charisma_mult": 1.0526315789473684,
                "hacking_exp_mult": 1.0526315789473684,
                "strength_exp_mult": 1.0526315789473684,
                "defense_exp_mult": 1.0526315789473684,
                "dexterity_exp_mult": 1.0526315789473684,
                "agility_exp_mult": 1.0526315789473684,
                "charisma_exp_mult": 1.0526315789473684,
                "hacking_chance_mult": 1.0526315789473684,
                "hacking_speed_mult": 1.0526315789473684,
                "hacking_money_mult": 1.0526315789473684,
                "hacking_grow_mult": 1.0526315789473684,
                "company_rep_mult": 1.0526315789473684,
                "faction_rep_mult": 1.0526315789473684,
                "crime_money_mult": 1.0526315789473684,
                "crime_success_mult": 1.0526315789473684,
                "work_money_mult": 1.0526315789473684,
                "hacknet_node_money_mult": 1.0526315789473684,
                "hacknet_node_purchase_cost_mult": 0.9523809523809523,
                "hacknet_node_ram_cost_mult": 0.9523809523809523,
                "hacknet_node_core_cost_mult": 0.9523809523809523,
                "hacknet_node_level_cost_mult": 0.9523809523809523
            },
            "startingCost": 0,
            "info": "The synthesis of human and machine is nothing to fear. It is our destiny. You will become greater than the sum of our parts. As One. Embrace your gift fully and wholly free of it's accursed toll. Serenity brings tranquility the form of no longer suffering a stat penalty. ",
            "stats": "Staneks Gift has no penalty."
        }
    },
    "companies": {
        "ECorp": {
            "name": "ECorp",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 3,
            "salaryMultiplier": 3,
            "jobStatReqOffset": 249,
            "isMegacorp": false
        },
        "MegaCorp": {
            "name": "MegaCorp",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 3,
            "salaryMultiplier": 3,
            "jobStatReqOffset": 249,
            "isMegacorp": false
        },
        "Bachman & Associates": {
            "name": "Bachman & Associates",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 2.6,
            "salaryMultiplier": 2.6,
            "jobStatReqOffset": 224,
            "isMegacorp": false
        },
        "Blade Industries": {
            "name": "Blade Industries",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 2.75,
            "salaryMultiplier": 2.75,
            "jobStatReqOffset": 224,
            "isMegacorp": false
        },
        "NWO": {
            "name": "NWO",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 2.75,
            "salaryMultiplier": 2.75,
            "jobStatReqOffset": 249,
            "isMegacorp": false
        },
        "Clarke Incorporated": {
            "name": "Clarke Incorporated",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 2.25,
            "salaryMultiplier": 2.25,
            "jobStatReqOffset": 224,
            "isMegacorp": false
        },
        "OmniTek Incorporated": {
            "name": "OmniTek Incorporated",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 2.25,
            "salaryMultiplier": 2.25,
            "jobStatReqOffset": 224,
            "isMegacorp": false
        },
        "Four Sigma": {
            "name": "Four Sigma",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 2.5,
            "salaryMultiplier": 2.5,
            "jobStatReqOffset": 224,
            "isMegacorp": false
        },
        "KuaiGong International": {
            "name": "KuaiGong International",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 2.2,
            "salaryMultiplier": 2.2,
            "jobStatReqOffset": 224,
            "isMegacorp": false
        },
        "Fulcrum Technologies": {
            "name": "Fulcrum Technologies",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true
            },
            "expMultiplier": 2,
            "salaryMultiplier": 2,
            "jobStatReqOffset": 224,
            "isMegacorp": false
        },
        "Storm Technologies": {
            "name": "Storm Technologies",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true
            },
            "expMultiplier": 1.8,
            "salaryMultiplier": 1.8,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "DefComm": {
            "name": "DefComm",
            "companyPositions": {
                "Chief Executive Officer": true,
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true
            },
            "expMultiplier": 1.75,
            "salaryMultiplier": 1.75,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "Helios Labs": {
            "name": "Helios Labs",
            "companyPositions": {
                "Chief Executive Officer": true,
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true
            },
            "expMultiplier": 1.8,
            "salaryMultiplier": 1.8,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "VitaLife": {
            "name": "VitaLife",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true
            },
            "expMultiplier": 1.8,
            "salaryMultiplier": 1.8,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "Icarus Microsystems": {
            "name": "Icarus Microsystems",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true
            },
            "expMultiplier": 1.9,
            "salaryMultiplier": 1.9,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "Universal Energy": {
            "name": "Universal Energy",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true
            },
            "expMultiplier": 2,
            "salaryMultiplier": 2,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "Galactic Cybersystems": {
            "name": "Galactic Cybersystems",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true
            },
            "expMultiplier": 1.9,
            "salaryMultiplier": 1.9,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "AeroCorp": {
            "name": "AeroCorp",
            "companyPositions": {
                "Chief Executive Officer": true,
                "Operations Manager": true,
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 1.7,
            "salaryMultiplier": 1.7,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "Omnia Cybersystems": {
            "name": "Omnia Cybersystems",
            "companyPositions": {
                "Chief Executive Officer": true,
                "Operations Manager": true,
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 1.7,
            "salaryMultiplier": 1.7,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "Solaris Space Systems": {
            "name": "Solaris Space Systems",
            "companyPositions": {
                "Chief Executive Officer": true,
                "Operations Manager": true,
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 1.7,
            "salaryMultiplier": 1.7,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "DeltaOne": {
            "name": "DeltaOne",
            "companyPositions": {
                "Chief Executive Officer": true,
                "Operations Manager": true,
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 1.6,
            "salaryMultiplier": 1.6,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "Global Pharmaceuticals": {
            "name": "Global Pharmaceuticals",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 1.8,
            "salaryMultiplier": 1.8,
            "jobStatReqOffset": 224,
            "isMegacorp": false
        },
        "Nova Medical": {
            "name": "Nova Medical",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 1.75,
            "salaryMultiplier": 1.75,
            "jobStatReqOffset": 199,
            "isMegacorp": false
        },
        "Central Intelligence Agency": {
            "name": "Central Intelligence Agency",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true,
                "Field Agent": true,
                "Secret Agent": true,
                "Special Operative": true
            },
            "expMultiplier": 2,
            "salaryMultiplier": 2,
            "jobStatReqOffset": 149,
            "isMegacorp": false
        },
        "National Security Agency": {
            "name": "National Security Agency",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true,
                "Field Agent": true,
                "Secret Agent": true,
                "Special Operative": true
            },
            "expMultiplier": 2,
            "salaryMultiplier": 2,
            "jobStatReqOffset": 149,
            "isMegacorp": false
        },
        "Watchdog Security": {
            "name": "Watchdog Security",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true,
                "Field Agent": true,
                "Secret Agent": true,
                "Special Operative": true,
                "Software Consultant": true,
                "Senior Software Consultant": true
            },
            "expMultiplier": 1.5,
            "salaryMultiplier": 1.5,
            "jobStatReqOffset": 124,
            "isMegacorp": false
        },
        "LexoCorp": {
            "name": "LexoCorp",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Chief Financial Officer": true,
                "Chief Executive Officer": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 1.4,
            "salaryMultiplier": 1.4,
            "jobStatReqOffset": 99,
            "isMegacorp": false
        },
        "Rho Construction": {
            "name": "Rho Construction",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true
            },
            "expMultiplier": 1.3,
            "salaryMultiplier": 1.3,
            "jobStatReqOffset": 49,
            "isMegacorp": false
        },
        "Alpha Enterprises": {
            "name": "Alpha Enterprises",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Business Intern": true,
                "Business Analyst": true,
                "Business Manager": true,
                "Operations Manager": true,
                "Software Consultant": true,
                "Senior Software Consultant": true
            },
            "expMultiplier": 1.5,
            "salaryMultiplier": 1.5,
            "jobStatReqOffset": 99,
            "isMegacorp": false
        },
        "Aevum Police Headquarters": {
            "name": "Aevum Police Headquarters",
            "companyPositions": {
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true,
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true
            },
            "expMultiplier": 1.3,
            "salaryMultiplier": 1.3,
            "jobStatReqOffset": 99,
            "isMegacorp": false
        },
        "SysCore Securities": {
            "name": "SysCore Securities",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true
            },
            "expMultiplier": 1.3,
            "salaryMultiplier": 1.3,
            "jobStatReqOffset": 124,
            "isMegacorp": false
        },
        "CompuTek": {
            "name": "CompuTek",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true
            },
            "expMultiplier": 1.2,
            "salaryMultiplier": 1.2,
            "jobStatReqOffset": 74,
            "isMegacorp": false
        },
        "NetLink Technologies": {
            "name": "NetLink Technologies",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true
            },
            "expMultiplier": 1.2,
            "salaryMultiplier": 1.2,
            "jobStatReqOffset": 99,
            "isMegacorp": false
        },
        "Carmichael Security": {
            "name": "Carmichael Security",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true,
                "Network Engineer": true,
                "Network Administrator": true,
                "Security Engineer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true,
                "Field Agent": true,
                "Secret Agent": true,
                "Special Operative": true,
                "Police Officer": true,
                "Police Chief": true,
                "Security Guard": true,
                "Security Officer": true,
                "Security Supervisor": true,
                "Head of Security": true
            },
            "expMultiplier": 1.2,
            "salaryMultiplier": 1.2,
            "jobStatReqOffset": 74,
            "isMegacorp": false
        },
        "FoodNStuff": {
            "name": "FoodNStuff",
            "companyPositions": {
                "Employee": true,
                "Part-time Employee": true
            },
            "expMultiplier": 1,
            "salaryMultiplier": 1,
            "jobStatReqOffset": 0,
            "isMegacorp": false
        },
        "Joe's Guns": {
            "name": "Joe's Guns",
            "companyPositions": {
                "Employee": true,
                "Part-time Employee": true
            },
            "expMultiplier": 1,
            "salaryMultiplier": 1,
            "jobStatReqOffset": 0,
            "isMegacorp": false
        },
        "Omega Software": {
            "name": "Omega Software",
            "companyPositions": {
                "Software Engineering Intern": true,
                "Junior Software Engineer": true,
                "Senior Software Engineer": true,
                "Lead Software Developer": true,
                "Head of Software": true,
                "Head of Engineering": true,
                "Vice President of Technology": true,
                "Chief Technology Officer": true,
                "Software Consultant": true,
                "Senior Software Consultant": true,
                "IT Intern": true,
                "IT Analyst": true,
                "IT Manager": true,
                "Systems Administrator": true
            },
            "expMultiplier": 1.1,
            "salaryMultiplier": 1.1,
            "jobStatReqOffset": 49,
            "isMegacorp": false
        },
        "Noodle Bar": {
            "name": "Noodle Bar",
            "companyPositions": {
                "Waiter": true,
                "Part-time Waiter": true
            },
            "expMultiplier": 1,
            "salaryMultiplier": 1,
            "jobStatReqOffset": 0,
            "isMegacorp": false
        }
    },
    "companyPositions": {
        "Software Engineering Intern": {
            "name": "Software Engineering Intern",
            "nextPosition": "Junior Software Engineer",
            "baseSalary": 33,
            "repMultiplier": 0.9,
            "requiredHacking": 1,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 0,
            "requiredReputation": 0,
            "hackingEffectiveness": 85,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.05,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.02
        },
        "Junior Software Engineer": {
            "name": "Junior Software Engineer",
            "nextPosition": "Senior Software Engineer",
            "baseSalary": 80,
            "repMultiplier": 1.1,
            "requiredHacking": 51,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 0,
            "requiredReputation": 8000,
            "hackingEffectiveness": 85,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.1,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.05
        },
        "Senior Software Engineer": {
            "name": "Senior Software Engineer",
            "nextPosition": "Lead Software Developer",
            "baseSalary": 165,
            "repMultiplier": 1.3,
            "requiredHacking": 251,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 51,
            "requiredReputation": 40000,
            "hackingEffectiveness": 80,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 20,
            "hackingExpGain": 0.4,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.08
        },
        "Lead Software Developer": {
            "name": "Lead Software Developer",
            "nextPosition": "Head of Software",
            "baseSalary": 500,
            "repMultiplier": 1.5,
            "requiredHacking": 401,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 151,
            "requiredReputation": 200000,
            "hackingEffectiveness": 75,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 25,
            "hackingExpGain": 0.8,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.1
        },
        "Head of Software": {
            "name": "Head of Software",
            "nextPosition": "Head of Engineering",
            "baseSalary": 800,
            "repMultiplier": 1.6,
            "requiredHacking": 501,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 251,
            "requiredReputation": 400000,
            "hackingEffectiveness": 75,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 25,
            "hackingExpGain": 1,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.5
        },
        "Head of Engineering": {
            "name": "Head of Engineering",
            "nextPosition": "Vice President of Technology",
            "baseSalary": 1650,
            "repMultiplier": 1.6,
            "requiredHacking": 501,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 251,
            "requiredReputation": 800000,
            "hackingEffectiveness": 75,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 25,
            "hackingExpGain": 1.1,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.5
        },
        "Vice President of Technology": {
            "name": "Vice President of Technology",
            "nextPosition": "Chief Technology Officer",
            "baseSalary": 2310,
            "repMultiplier": 1.75,
            "requiredHacking": 601,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 401,
            "requiredReputation": 1600000,
            "hackingEffectiveness": 70,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 30,
            "hackingExpGain": 1.2,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.6
        },
        "Chief Technology Officer": {
            "name": "Chief Technology Officer",
            "nextPosition": null,
            "baseSalary": 2640,
            "repMultiplier": 2,
            "requiredHacking": 751,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 501,
            "requiredReputation": 3200000,
            "hackingEffectiveness": 65,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 35,
            "hackingExpGain": 1.5,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 1
        },
        "IT Intern": {
            "name": "IT Intern",
            "nextPosition": "IT Analyst",
            "baseSalary": 26,
            "repMultiplier": 0.9,
            "requiredHacking": 1,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 0,
            "requiredReputation": 0,
            "hackingEffectiveness": 90,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 10,
            "hackingExpGain": 0.04,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.01
        },
        "IT Analyst": {
            "name": "IT Analyst",
            "nextPosition": "IT Manager",
            "baseSalary": 66,
            "repMultiplier": 1.1,
            "requiredHacking": 26,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 0,
            "requiredReputation": 7000,
            "hackingEffectiveness": 85,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.08,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.02
        },
        "IT Manager": {
            "name": "IT Manager",
            "nextPosition": "Systems Administrator",
            "baseSalary": 132,
            "repMultiplier": 1.3,
            "requiredHacking": 151,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 51,
            "requiredReputation": 35000,
            "hackingEffectiveness": 80,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 20,
            "hackingExpGain": 0.3,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.1
        },
        "Systems Administrator": {
            "name": "Systems Administrator",
            "nextPosition": "Head of Engineering",
            "baseSalary": 410,
            "repMultiplier": 1.4,
            "requiredHacking": 251,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 76,
            "requiredReputation": 175000,
            "hackingEffectiveness": 80,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 20,
            "hackingExpGain": 0.5,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.2
        },
        "Security Engineer": {
            "name": "Security Engineer",
            "nextPosition": "Head of Engineering",
            "baseSalary": 121,
            "repMultiplier": 1.2,
            "requiredHacking": 151,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 26,
            "requiredReputation": 35000,
            "hackingEffectiveness": 85,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.4,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.05
        },
        "Network Engineer": {
            "name": "Network Engineer",
            "nextPosition": "Network Administrator",
            "baseSalary": 121,
            "repMultiplier": 1.2,
            "requiredHacking": 151,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 26,
            "requiredReputation": 35000,
            "hackingEffectiveness": 85,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.4,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.05
        },
        "Network Administrator": {
            "name": "Network Administrator",
            "nextPosition": "Head of Engineering",
            "baseSalary": 410,
            "repMultiplier": 1.3,
            "requiredHacking": 251,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 76,
            "requiredReputation": 175000,
            "hackingEffectiveness": 80,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 20,
            "hackingExpGain": 0.5,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.1
        },
        "Business Intern": {
            "name": "Business Intern",
            "nextPosition": "Business Analyst",
            "baseSalary": 46,
            "repMultiplier": 0.9,
            "requiredHacking": 1,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 1,
            "requiredReputation": 0,
            "hackingEffectiveness": 10,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 90,
            "hackingExpGain": 0.01,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.08
        },
        "Business Analyst": {
            "name": "Business Analyst",
            "nextPosition": "Business Manager",
            "baseSalary": 100,
            "repMultiplier": 1.1,
            "requiredHacking": 6,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 51,
            "requiredReputation": 8000,
            "hackingEffectiveness": 15,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 85,
            "hackingExpGain": 0.02,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.15
        },
        "Business Manager": {
            "name": "Business Manager",
            "nextPosition": "Operations Manager",
            "baseSalary": 200,
            "repMultiplier": 1.3,
            "requiredHacking": 51,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 101,
            "requiredReputation": 40000,
            "hackingEffectiveness": 15,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 85,
            "hackingExpGain": 0.02,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.3
        },
        "Operations Manager": {
            "name": "Operations Manager",
            "nextPosition": "Chief Financial Officer",
            "baseSalary": 660,
            "repMultiplier": 1.5,
            "requiredHacking": 51,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 226,
            "requiredReputation": 200000,
            "hackingEffectiveness": 15,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 85,
            "hackingExpGain": 0.02,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.4
        },
        "Chief Financial Officer": {
            "name": "Chief Financial Officer",
            "nextPosition": "Chief Executive Officer",
            "baseSalary": 1950,
            "repMultiplier": 1.6,
            "requiredHacking": 76,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 501,
            "requiredReputation": 800000,
            "hackingEffectiveness": 10,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 90,
            "hackingExpGain": 0.05,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 1
        },
        "Chief Executive Officer": {
            "name": "Chief Executive Officer",
            "nextPosition": null,
            "baseSalary": 3900,
            "repMultiplier": 1.75,
            "requiredHacking": 101,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 751,
            "requiredReputation": 3200000,
            "hackingEffectiveness": 10,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 90,
            "hackingExpGain": 0.05,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 1.5
        },
        "Police Officer": {
            "name": "Police Officer",
            "nextPosition": "Police Chief",
            "baseSalary": 82,
            "repMultiplier": 1,
            "requiredHacking": 11,
            "requiredStrength": 101,
            "requiredDefense": 101,
            "requiredDexterity": 101,
            "requiredAgility": 101,
            "requiredCharisma": 51,
            "requiredReputation": 8000,
            "hackingEffectiveness": 5,
            "strengthEffectiveness": 20,
            "defenseEffectiveness": 20,
            "dexterityEffectiveness": 20,
            "agilityEffectiveness": 20,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.02,
            "strengthExpGain": 0.08,
            "defenseExpGain": 0.08,
            "dexterityExpGain": 0.08,
            "agilityExpGain": 0.08,
            "charismaExpGain": 0.04
        },
        "Police Chief": {
            "name": "Police Chief",
            "nextPosition": null,
            "baseSalary": 460,
            "repMultiplier": 1.25,
            "requiredHacking": 101,
            "requiredStrength": 301,
            "requiredDefense": 301,
            "requiredDexterity": 301,
            "requiredAgility": 301,
            "requiredCharisma": 151,
            "requiredReputation": 36000,
            "hackingEffectiveness": 5,
            "strengthEffectiveness": 20,
            "defenseEffectiveness": 20,
            "dexterityEffectiveness": 20,
            "agilityEffectiveness": 20,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.02,
            "strengthExpGain": 0.1,
            "defenseExpGain": 0.1,
            "dexterityExpGain": 0.1,
            "agilityExpGain": 0.1,
            "charismaExpGain": 0.1
        },
        "Security Guard": {
            "name": "Security Guard",
            "nextPosition": "Security Officer",
            "baseSalary": 50,
            "repMultiplier": 1,
            "requiredHacking": 0,
            "requiredStrength": 51,
            "requiredDefense": 51,
            "requiredDexterity": 51,
            "requiredAgility": 51,
            "requiredCharisma": 1,
            "requiredReputation": 0,
            "hackingEffectiveness": 5,
            "strengthEffectiveness": 20,
            "defenseEffectiveness": 20,
            "dexterityEffectiveness": 20,
            "agilityEffectiveness": 20,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.01,
            "strengthExpGain": 0.04,
            "defenseExpGain": 0.04,
            "dexterityExpGain": 0.04,
            "agilityExpGain": 0.04,
            "charismaExpGain": 0.02
        },
        "Security Officer": {
            "name": "Security Officer",
            "nextPosition": "Security Supervisor",
            "baseSalary": 195,
            "repMultiplier": 1.1,
            "requiredHacking": 26,
            "requiredStrength": 151,
            "requiredDefense": 151,
            "requiredDexterity": 151,
            "requiredAgility": 151,
            "requiredCharisma": 51,
            "requiredReputation": 8000,
            "hackingEffectiveness": 10,
            "strengthEffectiveness": 20,
            "defenseEffectiveness": 20,
            "dexterityEffectiveness": 20,
            "agilityEffectiveness": 20,
            "charismaEffectiveness": 10,
            "hackingExpGain": 0.02,
            "strengthExpGain": 0.1,
            "defenseExpGain": 0.1,
            "dexterityExpGain": 0.1,
            "agilityExpGain": 0.1,
            "charismaExpGain": 0.05
        },
        "Security Supervisor": {
            "name": "Security Supervisor",
            "nextPosition": "Head of Security",
            "baseSalary": 660,
            "repMultiplier": 1.25,
            "requiredHacking": 26,
            "requiredStrength": 251,
            "requiredDefense": 251,
            "requiredDexterity": 251,
            "requiredAgility": 251,
            "requiredCharisma": 101,
            "requiredReputation": 36000,
            "hackingEffectiveness": 10,
            "strengthEffectiveness": 15,
            "defenseEffectiveness": 15,
            "dexterityEffectiveness": 15,
            "agilityEffectiveness": 15,
            "charismaEffectiveness": 30,
            "hackingExpGain": 0.02,
            "strengthExpGain": 0.12,
            "defenseExpGain": 0.12,
            "dexterityExpGain": 0.12,
            "agilityExpGain": 0.12,
            "charismaExpGain": 0.1
        },
        "Head of Security": {
            "name": "Head of Security",
            "nextPosition": null,
            "baseSalary": 1320,
            "repMultiplier": 1.4,
            "requiredHacking": 51,
            "requiredStrength": 501,
            "requiredDefense": 501,
            "requiredDexterity": 501,
            "requiredAgility": 501,
            "requiredCharisma": 151,
            "requiredReputation": 144000,
            "hackingEffectiveness": 10,
            "strengthEffectiveness": 15,
            "defenseEffectiveness": 15,
            "dexterityEffectiveness": 15,
            "agilityEffectiveness": 15,
            "charismaEffectiveness": 30,
            "hackingExpGain": 0.05,
            "strengthExpGain": 0.15,
            "defenseExpGain": 0.15,
            "dexterityExpGain": 0.15,
            "agilityExpGain": 0.15,
            "charismaExpGain": 0.15
        },
        "Field Agent": {
            "name": "Field Agent",
            "nextPosition": "Secret Agent",
            "baseSalary": 330,
            "repMultiplier": 1,
            "requiredHacking": 101,
            "requiredStrength": 101,
            "requiredDefense": 101,
            "requiredDexterity": 101,
            "requiredAgility": 101,
            "requiredCharisma": 101,
            "requiredReputation": 8000,
            "hackingEffectiveness": 10,
            "strengthEffectiveness": 15,
            "defenseEffectiveness": 15,
            "dexterityEffectiveness": 20,
            "agilityEffectiveness": 20,
            "charismaEffectiveness": 20,
            "hackingExpGain": 0.04,
            "strengthExpGain": 0.08,
            "defenseExpGain": 0.08,
            "dexterityExpGain": 0.08,
            "agilityExpGain": 0.08,
            "charismaExpGain": 0.05
        },
        "Secret Agent": {
            "name": "Secret Agent",
            "nextPosition": "Special Operative",
            "baseSalary": 990,
            "repMultiplier": 1.25,
            "requiredHacking": 201,
            "requiredStrength": 251,
            "requiredDefense": 251,
            "requiredDexterity": 251,
            "requiredAgility": 251,
            "requiredCharisma": 201,
            "requiredReputation": 32000,
            "hackingEffectiveness": 15,
            "strengthEffectiveness": 15,
            "defenseEffectiveness": 15,
            "dexterityEffectiveness": 20,
            "agilityEffectiveness": 20,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.1,
            "strengthExpGain": 0.15,
            "defenseExpGain": 0.15,
            "dexterityExpGain": 0.15,
            "agilityExpGain": 0.15,
            "charismaExpGain": 0.1
        },
        "Special Operative": {
            "name": "Special Operative",
            "nextPosition": null,
            "baseSalary": 2000,
            "repMultiplier": 1.5,
            "requiredHacking": 251,
            "requiredStrength": 501,
            "requiredDefense": 501,
            "requiredDexterity": 501,
            "requiredAgility": 501,
            "requiredCharisma": 251,
            "requiredReputation": 162000,
            "hackingEffectiveness": 15,
            "strengthEffectiveness": 15,
            "defenseEffectiveness": 15,
            "dexterityEffectiveness": 20,
            "agilityEffectiveness": 20,
            "charismaEffectiveness": 15,
            "hackingExpGain": 0.15,
            "strengthExpGain": 0.2,
            "defenseExpGain": 0.2,
            "dexterityExpGain": 0.2,
            "agilityExpGain": 0.2,
            "charismaExpGain": 0.15
        },
        "Waiter": {
            "name": "Waiter",
            "nextPosition": null,
            "baseSalary": 22,
            "repMultiplier": 1,
            "requiredHacking": 0,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 0,
            "requiredReputation": 0,
            "hackingEffectiveness": 0,
            "strengthEffectiveness": 10,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 10,
            "agilityEffectiveness": 10,
            "charismaEffectiveness": 70,
            "hackingExpGain": 0,
            "strengthExpGain": 0.02,
            "defenseExpGain": 0.02,
            "dexterityExpGain": 0.02,
            "agilityExpGain": 0.02,
            "charismaExpGain": 0.05
        },
        "Employee": {
            "name": "Employee",
            "nextPosition": null,
            "baseSalary": 22,
            "repMultiplier": 1,
            "requiredHacking": 0,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 0,
            "requiredReputation": 0,
            "hackingEffectiveness": 0,
            "strengthEffectiveness": 10,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 10,
            "agilityEffectiveness": 10,
            "charismaEffectiveness": 70,
            "hackingExpGain": 0,
            "strengthExpGain": 0.02,
            "defenseExpGain": 0.02,
            "dexterityExpGain": 0.02,
            "agilityExpGain": 0.02,
            "charismaExpGain": 0.04
        },
        "Software Consultant": {
            "name": "Software Consultant",
            "nextPosition": "Senior Software Consultant",
            "baseSalary": 66,
            "repMultiplier": 1,
            "requiredHacking": 51,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 0,
            "requiredReputation": 0,
            "hackingEffectiveness": 80,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 20,
            "hackingExpGain": 0.08,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.03
        },
        "Senior Software Consultant": {
            "name": "Senior Software Consultant",
            "nextPosition": null,
            "baseSalary": 132,
            "repMultiplier": 1.2,
            "requiredHacking": 251,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 51,
            "requiredReputation": 0,
            "hackingEffectiveness": 75,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 25,
            "hackingExpGain": 0.25,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.06
        },
        "Business Consultant": {
            "name": "Business Consultant",
            "nextPosition": "Senior Business Consultant",
            "baseSalary": 66,
            "repMultiplier": 1,
            "requiredHacking": 6,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 51,
            "requiredReputation": 0,
            "hackingEffectiveness": 20,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 80,
            "hackingExpGain": 0.015,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.15
        },
        "Senior Business Consultant": {
            "name": "Senior Business Consultant",
            "nextPosition": null,
            "baseSalary": 525,
            "repMultiplier": 1.2,
            "requiredHacking": 51,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 226,
            "requiredReputation": 0,
            "hackingEffectiveness": 15,
            "strengthEffectiveness": 0,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 0,
            "agilityEffectiveness": 0,
            "charismaEffectiveness": 85,
            "hackingExpGain": 0.015,
            "strengthExpGain": 0,
            "defenseExpGain": 0,
            "dexterityExpGain": 0,
            "agilityExpGain": 0,
            "charismaExpGain": 0.3
        },
        "Part-time Waiter": {
            "name": "Part-time Waiter",
            "nextPosition": null,
            "baseSalary": 20,
            "repMultiplier": 1,
            "requiredHacking": 0,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 0,
            "requiredReputation": 0,
            "hackingEffectiveness": 0,
            "strengthEffectiveness": 10,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 10,
            "agilityEffectiveness": 10,
            "charismaEffectiveness": 70,
            "hackingExpGain": 0,
            "strengthExpGain": 0.0075,
            "defenseExpGain": 0.0075,
            "dexterityExpGain": 0.0075,
            "agilityExpGain": 0.0075,
            "charismaExpGain": 0.04
        },
        "Part-time Employee": {
            "name": "Part-time Employee",
            "nextPosition": null,
            "baseSalary": 20,
            "repMultiplier": 1,
            "requiredHacking": 0,
            "requiredStrength": 0,
            "requiredDefense": 0,
            "requiredDexterity": 0,
            "requiredAgility": 0,
            "requiredCharisma": 0,
            "requiredReputation": 0,
            "hackingEffectiveness": 0,
            "strengthEffectiveness": 10,
            "defenseEffectiveness": 0,
            "dexterityEffectiveness": 10,
            "agilityEffectiveness": 10,
            "charismaEffectiveness": 70,
            "hackingExpGain": 0,
            "strengthExpGain": 0.0075,
            "defenseExpGain": 0.0075,
            "dexterityExpGain": 0.0075,
            "agilityExpGain": 0.0075,
            "charismaExpGain": 0.03
        }
    },
    "factions": {
        "Illuminati": {
            "augmentations": [
                "Synthetic Heart",
                "Synfibril Muscle",
                "NEMEAN Subdermal Weave",
                "Embedded Netburner Module Core V3 Upgrade",
                "Embedded Netburner Module Analyze Engine",
                "Embedded Netburner Module Direct Memory Access Upgrade",
                "NeuroFlux Governor",
                "QLink"
            ],
            "infoText": "Humanity never changes. No matter how civilized society becomes, it will eventually fall back into chaos. And from this chaos, we are the invisible hand that guides them to order. ",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Daedalus": {
            "augmentations": [
                "Synthetic Heart",
                "Synfibril Muscle",
                "NEMEAN Subdermal Weave",
                "Embedded Netburner Module Core V3 Upgrade",
                "Embedded Netburner Module Analyze Engine",
                "Embedded Netburner Module Direct Memory Access Upgrade",
                "NeuroFlux Governor",
                "The Red Pill"
            ],
            "infoText": "Yesterday we obeyed kings and bent our necks to emperors. Today we kneel only to truth.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "The Covenant": {
            "augmentations": [
                "Augmented Targeting III",
                "Synthetic Heart",
                "Synfibril Muscle",
                "Combat Rib III",
                "NEMEAN Subdermal Weave",
                "Graphene Bone Lacings",
                "Embedded Netburner Module Core V3 Upgrade",
                "Embedded Netburner Module Analyze Engine",
                "Embedded Netburner Module Direct Memory Access Upgrade",
                "NeuroFlux Governor",
                "SPTN-97 Gene Modification"
            ],
            "infoText": "Surrender yourself. Give up your empty individuality to become part of something great, something eternal. Become a slave. Submit your mind, body, and soul. Only then can you set yourself free.\n\nOnly then can you discover immortality.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "ECorp": {
            "augmentations": [
                "Graphene Bionic Spine Upgrade",
                "Graphene Bionic Legs Upgrade",
                "Embedded Netburner Module",
                "Embedded Netburner Module Core Implant",
                "Embedded Netburner Module Core V2 Upgrade",
                "Embedded Netburner Module Core V3 Upgrade",
                "Embedded Netburner Module Analyze Engine",
                "Embedded Netburner Module Direct Memory Access Upgrade",
                "PC Direct-Neural Interface",
                "PC Direct-Neural Interface Optimization Submodule",
                "NeuroFlux Governor",
                "ECorp HVMind Implant"
            ],
            "infoText": "ECorp's mission is simple: to connect the world of today with the technology of tomorrow. With our wide range of Internet-related software and commercial hardware, ECorp makes the world's information universally accessible.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "MegaCorp": {
            "augmentations": [
                "Graphene Bionic Legs Upgrade",
                "Embedded Netburner Module",
                "Embedded Netburner Module Core Implant",
                "Embedded Netburner Module Core V2 Upgrade",
                "Embedded Netburner Module Core V3 Upgrade",
                "Embedded Netburner Module Analyze Engine",
                "Embedded Netburner Module Direct Memory Access Upgrade",
                "ADR-V1 Pheromone Gene",
                "NeuroFlux Governor",
                "CordiARC Fusion Reactor"
            ],
            "infoText": "MegaCorp does what no other dares to do. We imagine. We create. We invent. We create what others have never even dreamed of. Our work fills the world's needs for food, water, power, and transportation on an unprecendented scale, in ways that no other company can.\n\nIn our labs and factories and on the ground with customers, MegaCorp is ushering in a new era for the world.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "Bachman & Associates": {
            "augmentations": [
                "Enhanced Social Interaction Implant",
                "Neuralstimulator",
                "Nuoptimal Nootropic Injector Implant",
                "Speech Enhancement",
                "FocusWire",
                "ADR-V2 Pheromone Gene",
                "NeuroFlux Governor",
                "SmartJaw"
            ],
            "infoText": "Where Law and Business meet - thats where we are.\n\nLegal Insight - Business Instinct - Innovative Experience.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "Blade Industries": {
            "augmentations": [
                "Augmented Targeting I",
                "Augmented Targeting II",
                "Augmented Targeting III",
                "Synfibril Muscle",
                "Combat Rib I",
                "Combat Rib II",
                "Combat Rib III",
                "Nanofiber Weave",
                "Bionic Spine",
                "Bionic Legs",
                "Embedded Netburner Module",
                "Embedded Netburner Module Core Implant",
                "Embedded Netburner Module Core V2 Upgrade",
                "PC Direct-Neural Interface",
                "PC Direct-Neural Interface Optimization Submodule",
                "NeuroFlux Governor",
                "HyperSight Corneal Implant",
                "Neotra"
            ],
            "infoText": "Augmentation is Salvation.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "NWO": {
            "augmentations": [
                "Synthetic Heart",
                "Synfibril Muscle",
                "Enhanced Social Interaction Implant",
                "Embedded Netburner Module",
                "Embedded Netburner Module Core Implant",
                "Embedded Netburner Module Core V2 Upgrade",
                "Embedded Netburner Module Core V3 Upgrade",
                "Embedded Netburner Module Analyze Engine",
                "Embedded Netburner Module Direct Memory Access Upgrade",
                "ADR-V1 Pheromone Gene",
                "NeuroFlux Governor",
                "Neurotrainer III",
                "Power Recirculation Core",
                "Xanipher",
                "Hydroflame Left Arm"
            ],
            "infoText": "Humans don't truly desire freedom. They want to be observed, understood, and judged. They want to be given purpose and direction in life. That is why they created God. And that is why they created civilization - not because of willingness, but because of a need to be incorporated into higher orders of structure and meaning.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "Clarke Incorporated": {
            "augmentations": [
                "Enhanced Social Interaction Implant",
                "Neuralstimulator",
                "Neuronal Densification",
                "Nuoptimal Nootropic Injector Implant",
                "Speech Enhancement",
                "FocusWire",
                "ADR-V2 Pheromone Gene",
                "NeuroFlux Governor",
                "nextSENS Gene Modification"
            ],
            "infoText": "The Power of the Genome - Unlocked.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "OmniTek Incorporated": {
            "augmentations": [
                "Augmented Targeting I",
                "Augmented Targeting II",
                "Augmented Targeting III",
                "Combat Rib I",
                "Combat Rib II",
                "Combat Rib III",
                "Nanofiber Weave",
                "Bionic Spine",
                "Bionic Legs",
                "Enhanced Social Interaction Implant",
                "Embedded Netburner Module Core V2 Upgrade",
                "PC Direct-Neural Interface",
                "NeuroFlux Governor",
                "OmniTek InfoLoad"
            ],
            "infoText": "Simply put, our mission is to design and build robots that make a difference.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "Four Sigma": {
            "augmentations": [
                "Enhanced Social Interaction Implant",
                "Neuralstimulator",
                "Nuoptimal Nootropic Injector Implant",
                "Speech Enhancement",
                "FocusWire",
                "PC Direct-Neural Interface",
                "ADR-V1 Pheromone Gene",
                "ADR-V2 Pheromone Gene",
                "NeuroFlux Governor",
                "Neurotrainer III"
            ],
            "infoText": "The scientific method is the best way to approach investing. Big strategies backed up with big data. Driven by deep learning and innovative ideas. And improved by iteration. That's Four Sigma.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "KuaiGong International": {
            "augmentations": [
                "Augmented Targeting I",
                "Augmented Targeting II",
                "Augmented Targeting III",
                "Synthetic Heart",
                "Synfibril Muscle",
                "Combat Rib I",
                "Combat Rib II",
                "Combat Rib III",
                "Bionic Spine",
                "Bionic Legs",
                "Embedded Netburner Module Core V2 Upgrade",
                "Speech Enhancement",
                "FocusWire",
                "NeuroFlux Governor",
                "HyperSight Corneal Implant",
                "Photosynthetic Cells"
            ],
            "infoText": "Dream big. Work hard. Make history.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "Fulcrum Secret Technologies": {
            "augmentations": [
                "Synthetic Heart",
                "Synfibril Muscle",
                "Nanofiber Weave",
                "NEMEAN Subdermal Weave",
                "Graphene Bone Lacings",
                "Graphene Bionic Spine Upgrade",
                "Graphene Bionic Legs Upgrade",
                "Artificial Bio-neural Network Implant",
                "Enhanced Myelin Sheathing",
                "Embedded Netburner Module",
                "Embedded Netburner Module Core Implant",
                "Embedded Netburner Module Core V2 Upgrade",
                "Embedded Netburner Module Core V3 Upgrade",
                "Embedded Netburner Module Analyze Engine",
                "Embedded Netburner Module Direct Memory Access Upgrade",
                "PC Direct-Neural Interface Optimization Submodule",
                "PC Direct-Neural Interface NeuroNet Injector",
                "NeuroFlux Governor"
            ],
            "infoText": "The human organism has an innate desire to worship. That is why they created gods. If there were no gods, it would be necessary to create them. And now we can.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": false,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": false
        },
        "BitRunners": {
            "augmentations": [
                "Artificial Bio-neural Network Implant",
                "Enhanced Myelin Sheathing",
                "DataJack",
                "Embedded Netburner Module",
                "Embedded Netburner Module Core Implant",
                "Embedded Netburner Module Core V2 Upgrade",
                "Neural Accelerator",
                "Cranial Signal Processors - Gen III",
                "Cranial Signal Processors - Gen IV",
                "Cranial Signal Processors - Gen V",
                "NeuroFlux Governor",
                "Neurotrainer II",
                "BitRunners Neurolink"
            ],
            "infoText": "Our entire lives are controlled by bits. All of our actions, our thoughts, our personal information. It's all transformed into bits, stored in bits, communicated through bits. It’s impossible for any person to move, to live, to operate at any level without the use of bits. And when a person moves, lives, and operates, they leave behind their bits, mere traces of seemingly meaningless fragments of information. But these bits can be reconstructed. Transformed. Used.\n\nThose who run the bits, run the world.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": false,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "The Black Hand": {
            "augmentations": [
                "Artificial Synaptic Potentiation",
                "Enhanced Myelin Sheathing",
                "DataJack",
                "Embedded Netburner Module",
                "Embedded Netburner Module Core Implant",
                "Neuralstimulator",
                "Cranial Signal Processors - Gen III",
                "Cranial Signal Processors - Gen IV",
                "NeuroFlux Governor",
                "The Black Hand"
            ],
            "infoText": "The world, so afraid of strong government, now has no government. Only power - Digital power. Financial power. Technological power. And those at the top rule with an invisible hand. They built a society where the rich get richer, and everyone else suffers.\n\nSo much pain. So many lives. Their darkness must end.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "NiteSec": {
            "augmentations": [
                "BitWire",
                "Artificial Synaptic Potentiation",
                "Neural-Retention Enhancement",
                "DataJack",
                "Embedded Netburner Module",
                "Cranial Signal Processors - Gen II",
                "Cranial Signal Processors - Gen III",
                "NeuroFlux Governor",
                "Neurotrainer II",
                "CRTX42-AA Gene Modification"
            ],
            "infoText": "                  __..__               \n                _.nITESECNIt.            \n             .-'NITESECNITESEc.          \n           .'    NITESECNITESECn         \n          /       NITESECNITESEC;        \n         :        :NITESECNITESEC;       \n         ;       $ NITESECNITESECN       \n        :    _,   ,N'ITESECNITESEC       \n        : .+^^`,  :    `NITESECNIT       \n         ) /),     `-,-=,NITESECNI       \n        /  ^         ,-;|NITESECN;       \n       /     _.'     '-';NITESECN        \n      (  ,           ,-''`^NITE'         \n       )`            :`.    .'           \n       )--           ;  `- /             \n       '        _.-'     :              \n       (     _.-'   .                  \n        ------.                       \n                .                     \n                         _.nIt          \n                    _.nITESECNi         \n                   nITESECNIT^'         \n                   NITE^' ___           \n                  /    .gP''''Tp.       \n                 :    d'     .  `b      \n                 ;   d'       o  `b ;    \n                /   d;            `b|    \n               /,   $;          @  `:    \n              /'    $/               ;   \n            .'      $/b          o   |   \n          .'       d$/$;             :   \n         /       .d/$/$;          ,   ;  \n        d      .dNITESEC          $   |  \n       :bp.__.gNITESEC/$         :$   ;  \n       NITESECNITESECNIT         /$b :   \n",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": false,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Aevum": {
            "augmentations": [
                "Wired Reflexes",
                "Speech Processor Implant",
                "Synaptic Enhancement Implant",
                "Neuralstimulator",
                "NeuroFlux Governor",
                "Neurotrainer I",
                "PCMatrix"
            ],
            "infoText": "The Silicon City.",
            "enemies": [
                "Chongqing",
                "New Tokyo",
                "Ishima",
                "Volhaven"
            ],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Chongqing": {
            "augmentations": [
                "Speech Processor Implant",
                "DataJack",
                "Neuralstimulator",
                "Nuoptimal Nootropic Injector Implant",
                "NeuroFlux Governor",
                "Neuregen Gene Modification"
            ],
            "infoText": "Serve the People.",
            "enemies": [
                "Sector-12",
                "Aevum",
                "Volhaven"
            ],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Ishima": {
            "augmentations": [
                "Augmented Targeting I",
                "Combat Rib I",
                "Wired Reflexes",
                "Speech Processor Implant",
                "Neuralstimulator",
                "NeuroFlux Governor",
                "INFRARET Enhancement"
            ],
            "infoText": "The East Asian Order of the Future.",
            "enemies": [
                "Sector-12",
                "Aevum",
                "Volhaven"
            ],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "New Tokyo": {
            "augmentations": [
                "Speech Processor Implant",
                "DataJack",
                "Neuralstimulator",
                "Nuoptimal Nootropic Injector Implant",
                "NeuroFlux Governor",
                "NutriGen Implant"
            ],
            "infoText": "Asia's World City.",
            "enemies": [
                "Sector-12",
                "Aevum",
                "Volhaven"
            ],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Sector-12": {
            "augmentations": [
                "Augmented Targeting I",
                "Augmented Targeting II",
                "Wired Reflexes",
                "Speech Processor Implant",
                "Neuralstimulator",
                "NeuroFlux Governor",
                "CashRoot Starter Kit"
            ],
            "infoText": "The City of the Future.",
            "enemies": [
                "Chongqing",
                "New Tokyo",
                "Ishima",
                "Volhaven"
            ],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Volhaven": {
            "augmentations": [
                "Combat Rib I",
                "Combat Rib II",
                "Wired Reflexes",
                "Speech Processor Implant",
                "Neuralstimulator",
                "Nuoptimal Nootropic Injector Implant",
                "NeuroFlux Governor",
                "DermaForce Particle Barrier"
            ],
            "infoText": "Benefit, Honor, and Glory.",
            "enemies": [
                "Chongqing",
                "Sector-12",
                "New Tokyo",
                "Aevum",
                "Ishima"
            ],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Speakers for the Dead": {
            "augmentations": [
                "Unstable Circadian Modulator",
                "Synthetic Heart",
                "Synfibril Muscle",
                "Nanofiber Weave",
                "Wired Reflexes",
                "Bionic Spine",
                "Bionic Legs",
                "Speech Enhancement",
                "The Shadow's Simulacrum",
                "NeuroFlux Governor",
                "Graphene BrachiBlades Upgrade"
            ],
            "infoText": "It is better to reign in Hell than to serve in Heaven.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "The Dark Army": {
            "augmentations": [
                "HemoRecirculator",
                "Augmented Targeting I",
                "Augmented Targeting II",
                "Augmented Targeting III",
                "Combat Rib I",
                "Combat Rib II",
                "Combat Rib III",
                "Nanofiber Weave",
                "Wired Reflexes",
                "The Shadow's Simulacrum",
                "NeuroFlux Governor",
                "Power Recirculation Core",
                "Graphene Bionic Arms Upgrade"
            ],
            "infoText": "The World doesn't care about right or wrong. It only cares about power.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "The Syndicate": {
            "augmentations": [
                "HemoRecirculator",
                "Augmented Targeting I",
                "Augmented Targeting II",
                "Augmented Targeting III",
                "Combat Rib I",
                "Combat Rib II",
                "Combat Rib III",
                "Nanofiber Weave",
                "NEMEAN Subdermal Weave",
                "Wired Reflexes",
                "Bionic Spine",
                "Bionic Legs",
                "ADR-V1 Pheromone Gene",
                "The Shadow's Simulacrum",
                "NeuroFlux Governor",
                "Power Recirculation Core",
                "BrachiBlades"
            ],
            "infoText": "Honor holds you back.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Silhouette": {
            "augmentations": [
                "Speech Processor Implant",
                "TITN-41 Gene-Modification Injection",
                "ADR-V2 Pheromone Gene",
                "NeuroFlux Governor"
            ],
            "infoText": "Corporations have filled the void of power left behind by the collapse of Western government. The issue is they've become so big that you don't know who they're working for. And if you're employed at one of these corporations, you don't even know who you're working for.\n\nThat's terror. Terror, fear, and corruption. All born into the system, all propagated by the system.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": true,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Tetrads": {
            "augmentations": [
                "HemoRecirculator",
                "NeuroFlux Governor",
                "LuminCloaking-V1 Skin Implant",
                "LuminCloaking-V2 Skin Implant",
                "Power Recirculation Core",
                "Bionic Arms"
            ],
            "infoText": "Following the mandate of Heaven and carrying out the way.",
            "enemies": [],
            "offerHackingMission": false,
            "offerHackingWork": false,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Slum Snakes": {
            "augmentations": [
                "Augmented Targeting I",
                "Combat Rib I",
                "Wired Reflexes",
                "NeuroFlux Governor",
                "LuminCloaking-V1 Skin Implant",
                "LuminCloaking-V2 Skin Implant",
                "SmartSonar Implant"
            ],
            "infoText": "Slum Snakes rule!",
            "enemies": [],
            "offerHackingMission": false,
            "offerHackingWork": false,
            "offerFieldWork": true,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Netburners": {
            "augmentations": [
                "Hacknet Node CPU Architecture Neural-Upload",
                "Hacknet Node Cache Architecture Neural-Upload",
                "Hacknet Node NIC Architecture Neural-Upload",
                "Hacknet Node Kernel Direct-Neural Interface",
                "Hacknet Node Core Direct-Neural Interface",
                "NeuroFlux Governor"
            ],
            "infoText": "~~//*>H4CK||3T 8URN3R5**>?>\\~~",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": false,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Tian Di Hui": {
            "augmentations": [
                "Nanofiber Weave",
                "Wired Reflexes",
                "Speech Processor Implant",
                "Nuoptimal Nootropic Injector Implant",
                "Speech Enhancement",
                "ADR-V1 Pheromone Gene",
                "NeuroFlux Governor",
                "Social Negotiation Assistant (S.N.A)",
                "Neuroreceptor Management Implant"
            ],
            "infoText": "Obey Heaven and work righteously.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": false,
            "offerSecurityWork": true,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "CyberSec": {
            "augmentations": [
                "BitWire",
                "Synaptic Enhancement Implant",
                "Cranial Signal Processors - Gen I",
                "Cranial Signal Processors - Gen II",
                "NeuroFlux Governor",
                "Neurotrainer I"
            ],
            "infoText": "The Internet is the first thing that was built that we don't fully understand, the largest experiment in anarchy that we have ever had. And as the world becomes increasingly dominated by it, society approaches the brink of total chaos. We serve only to protect society, to protect humanity, to protect the world from imminent collapse.",
            "enemies": [],
            "offerHackingMission": true,
            "offerHackingWork": true,
            "offerFieldWork": false,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": false
        },
        "Bladeburners": {
            "augmentations": [
                "EsperTech Bladeburner Eyewear",
                "EMS-4 Recombination",
                "ORION-MKIV Shoulder",
                "Hyperion Plasma Cannon V1",
                "Hyperion Plasma Cannon V2",
                "GOLEM Serum",
                "Vangelis Virus",
                "Vangelis Virus 3.0",
                "I.N.T.E.R.L.I.N.K.E.D",
                "Blade's Runners",
                "BLADE-51b Tesla Armor",
                "BLADE-51b Tesla Armor: Power Cells Upgrade",
                "BLADE-51b Tesla Armor: Energy Shielding Upgrade",
                "BLADE-51b Tesla Armor: Unibeam Upgrade",
                "BLADE-51b Tesla Armor: Omnibeam Upgrade",
                "BLADE-51b Tesla Armor: IPU Upgrade",
                "The Blade's Simulacrum"
            ],
            "infoText": "It's too bad they won't live. But then again, who does?\n\nNote that for this faction, reputation can only be gained through Bladeburner actions. Completing Bladeburner contracts/operations will increase your reputation.",
            "enemies": [],
            "offerHackingMission": false,
            "offerHackingWork": false,
            "offerFieldWork": false,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": false,
            "special": true
        },
        "Church of the Machine God": {
            "augmentations": [
                "Stanek's Gift - Genesis",
                "Stanek's Gift - Awakening",
                "Stanek's Gift - Serenity"
            ],
            "infoText": "                 ``          \n             -odmmNmds:      \n           `hNmo:..-omNh.    \n           yMd`      `hNh    \n           mMd        oNm    \n           oMNo      .mM/    \n           `dMN+    -mM+     \n            -mMNo  -mN+      \n  .+-        :mMNo/mN/       \n:yNMd.        :NMNNN/        \n-mMMMh.        /NMMh`        \n .dMMMd.       /NMMMy`       \n  `yMMMd.     /NNyNMMh`      \n   `sMMMd.   +Nm: +NMMh.     \n     oMMMm- oNm:   /NMMd.    \n      +NMMmsMm-     :mMMd.   \n       /NMMMm-       -mMMd.  \n        /MMMm-        -mMMd. \n       `sMNMMm-        .mMmo \n      `sMd:hMMm.        ./.  \n     `yMy` `yNMd`            \n    `hMs`    oMMy            \n   `hMh       sMN-           \n   /MM-       .NMo           \n   +MM:       :MM+           \n    sNNo-.`.-omNy`           \n     -smNNNNmdo-             \n        `..`                 \n\nMany cultures predict an end to humanity in the near future, a final Armageddon that will end the world; but we disagree.\n\nNote that for this faction, reputation can only be gained by charging Stanek's gift.",
            "enemies": [],
            "offerHackingMission": false,
            "offerHackingWork": false,
            "offerFieldWork": false,
            "offerSecurityWork": false,
            "augmentationPriceMult": 1,
            "augmentationRepRequirementMult": 1,
            "keep": true,
            "special": true
        }
    }
}

const extra: {
    factions:     { [name: string]: { reqs: any, enemies?: string[], server?: string, company?: string } },
    fields:       { [name: string]: string },
    faction_work: { [name: string]: number[] }
} = {
    "factions": {
        "CyberSec": {
            "reqs": { "backdoor": "CSEC" },
            "server": "CSEC",
        },
        "NiteSec": {
            "reqs": { "backdoor": "avmnite-02h" },
            "server": "avmnite-02h",
        },
        "The Black Hand": {
            "reqs": { "backdoor": "I.I.I.I" },
            "server": "I.I.I.I",
        },
        "BitRunners": {
            "reqs": { "backdoor": "run4theh111z" },
            "server": "run4theh111z",
        },
        "Tian Di Hui": {
            "reqs": {
                "money": 1e6,
                "hacking": 50,
                "city": [ "Chongqing", "New Tokyo", "Ishima" ]
            },
        },
        "Netburners": {
            "reqs": {
                "hacking": 80,
                "hacknetLevel": 100,
                "hacknetRAM": 8,
                "hacknetCores": 4,
            },
        },
        "Sector-12": {
            "reqs": {
                "money": 15e6,
                "city": [ "Sector-12" ]
            },
            "enemies": [
                "Chongqing",
                "New Tokyo",
                "Ishima",
                "Volhaven"
            ],
        },
        "Aevum": {
            "reqs": {
                "money": 40e6,
                "city": [ "Aevum" ]
            },
            "enemies": [
                "Chongqing",
                "New Tokyo",
                "Ishima",
                "Volhaven"
            ],
        },
        "Volhaven": {
            "reqs": {
                "money": 50e6,
                "city": [ "Volhaven" ]
            },
            "enemies": [
                "Chongqing",
                "Sector-12",
                "New Tokyo",
                "Aevum",
                "Ishima"
            ],
        },
        "Chongqing": {
            "reqs": {
                "money": 20e6,
                "city": [ "Chongqing" ]
            },
            "enemies": [
                "Sector-12",
                "Aevum",
                "Volhaven"
            ],
        },
        "New Tokyo": {
            "reqs": {
                "money": 20e6,
                "city": [ "New Tokyo" ]
            },
            "enemies": [
                "Sector-12",
                "Aevum",
                "Volhaven"
            ],
        },
        "Ishima": {
            "reqs": {
                "money": 30e6,
                "city": [ "Ishima" ]
            },
            "enemies": [
                "Sector-12",
                "Aevum",
                "Volhaven"
            ],
        },
        "ECorp": {
            "reqs": { "company": 200e3 },
            "company": "ECorp",
            "server": "ecorp",
        },
        "MegaCorp": {
            "reqs": { "company": 200e3 },
            "company": "MegaCorp",
            "server": "megacorp",
        },
        "Bachman & Associates": {
            "reqs": { "company": 200e3 },
            "company": "Bachman & Associates",
            "server": "b-and-a",
        },
        "Blade Industries": {
            "reqs": { "company": 200e3 },
            "company": "Blade Industries",
            "server": "blade",
        },
        "NWO": {
            "reqs": { "company": 200e3 },
            "company": "NWO",
            "server": "nwo",
        },
        "Clarke Incorporated": {
            "reqs": { "company": 200e3 },
            "company": "Clarke Incorporated",
            "server": "clarkinc",
        },
        "OmniTek Incorporated": {
            "reqs": { "company": 200e3 },
            "company": "OmniTek Incorporated",
            "server": "omnitek",
        },
        "Four Sigma": {
            "reqs": { "company": 200e3 },
            "company": "Four Sigma",
            "server": "4sigma",
        },
        "KuaiGong International": {
            "reqs": { "company": 200e3 },
            "company": "KuaiGong International",
            "server": "kwaigong",
        },
        "Fulcrum Secret Technologies": {
            "reqs": {
                "company": 200e3,
                "backdoor": "fulcrumassets"
            },
            "company": "Fulcrum Technologies",
            "server": "fulcrumtech",
        },
        "Speakers for the Dead": {
            "reqs": {
                "hacking": 100,
                "combat": 300,
                "kills": 30,
                "karma": -45,
                "nocompany": [ "CIA", "NSA" ]
            },
        },
        "The Dark Army": {
            "reqs": {
                "hacking": 300,
                "combat": 300,
                "city": [ "Chongqing" ],
                "kills": 5,
                "karma": -45,
                "nocompany": [ "CIA", "NSA" ]
            },
        },
        "The Syndicate": {
            "reqs": {
                "money": 10e6,
                "hacking": 200,
                "combat": 200,
                "city": [ "Aevum", "Sector-12" ],
                "karma": -90,
                "nocompany": [ "CIA", "NSA" ]
            },
        },
        "Silhouette": {
            "reqs": {
                "money": 15e6,
                "karma": -22,
                "job": [
                    "Chief Technical Officer",
                    "Chief Financial Officer",
                    "Chief Executive Officer"
                ]
            },
        },
        "Tetrads": {
            "reqs": {
                "combat": 200,
                "city": [ "Chongqing", "New Tokyo", "Ishima" ],
                "karma": -18,
            },
        },
        "Slum Snakes": {
            "reqs": {
                "money": 1e6,
                "combat": 30,
                "karma": -9,
            },
        },
        "The Covenant": {
            "reqs": {
                "augs": 20,
                "money": 75e9,
                "hacking": 850,
                "combat": 850
            },
        },
        "Illuminati": {
            "reqs": {
                "augs": 30,
                "money": 150e9,
                "hacking": 1500,
                "combat": 1200
            },
        },
        "Daedalus": {
            "reqs": { "special": "daedalus" },
        },
        "Bladeburners": {
            "reqs": { "special": "bladeburners" },
        },
        "Church of the Machine God": {
            "reqs": { "special": "stanek" },
        }
    },
    "fields": {
        "Software"            : "Software Engineering Intern",
        "Software Consultant" : "Software Consultant",
        "IT"                  : "IT Intern",
        "Security Engineer"   : "Security Engineer",
        "Network Engineer"    : "Network Engineer",
        "Business"            : "Business Intern",
        "Business Consultant" : "Business Consultant",
        "Security"            : "Security Guard",
        "Agent"               : "Field Agent",
        "Employee"            : "Employee",
        "Part-time Employee"  : "Part-time Employee",
        "Waiter"              : "Waiter",
        "Part-time Waiter"    : "Part-time Waiter"
    },
    "faction_work": {
        "Hacking":  [ 1,    0,    0,    0,    0,    0,    1/3,  0.15, 0.00, 0.00, 0.00, 0.00, 0.00 ],
        "Security": [ 1/5,  1/5,  1/5,  1/5,  1/5,  0,    1/5,  0.05, 0.15, 0.15, 0.15, 0.15, 0.00 ],
        "Field":    [ 9/55, 9/55, 9/55, 9/55, 9/55, 9/55, 9/55, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10 ]
    }
}

export async function main(ns: NS) {
    if (!globalThis.data) { globalThis.data = {} as any; }
    data.augs         = {};
    data.faction_work = {};
    data.factions     = {};
    data.jobs         = {};
    data.companies    = {};

    for (const [name, aug] of Object.entries(dump.augs)) {
        data.augs[name] = {
            name     : name,
            cost     : aug.baseCost,
            rep      : aug.baseRepRequirement,
            prereqs  : aug.prereqs,
            mults    : aug.mults,
            factions : []
        };
    }

    for (const [name, mults] of Object.entries(extra.faction_work)) {
        data.faction_work[name] = {
            rep_skill_mult : mults[ 0] * 5e-3 / 995,
            rep_str_mult   : mults[ 1] * 5e-3 / 995,
            rep_def_mult   : mults[ 2] * 5e-3 / 995,
            rep_dex_mult   : mults[ 3] * 5e-3 / 995,
            rep_agi_mult   : mults[ 4] * 5e-3 / 995,
            rep_cha_mult   : mults[ 5] * 5e-3 / 995,
            rep_int_mult   : mults[ 6] * 5e-3 / 995,
            skill_rate     : mults[ 8] * 5e-3,
            str_rate       : mults[ 9] * 5e-3,
            def_rate       : mults[10] * 5e-3,
            dex_rate       : mults[11] * 5e-3,
            agi_rate       : mults[12] * 5e-3,
            cha_rate       : mults[13] * 5e-3
        };
    }

    for (const [name, faction] of Object.entries(dump.factions)) {
        const faction_ex = extra.factions[name as keyof typeof extra.factions];

        data.factions[name] = {
            name : name,
            reqs : faction_ex.reqs as any,
            augs : faction.augmentations,
            work : {},
            keep : faction.keep
        };

        if (faction.offerHackingWork)  { data.factions[name].work["Hacking"]  = data.faction_work["Hacking"];  }
        if (faction.offerFieldWork)    { data.factions[name].work["Security"] = data.faction_work["Security"]; }
        if (faction.offerSecurityWork) { data.factions[name].work["Field"]    = data.faction_work["Field"];    }
        
        if (faction.enemies.length > 0) { data.factions[name].enemies = faction.enemies; }
        if (faction_ex.company) { data.factions[name].company = faction_ex.company; }
        if (faction_ex.server) { data.factions[name].server = faction_ex.server; }

        for (let aug_name of data.factions[name].augs) {
            data.augs[aug_name].factions.push(name);
        }
    }

    for (const [name, position] of Object.entries(dump.companyPositions)) {
        data.jobs[name] = position;
    }

    for (const [name, company] of Object.entries(dump.companies)) {
        data.companies[name] = {
            name: name,
            fields: {},
            exp_mult:   company.expMultiplier,
            money_mult: company.salaryMultiplier,
            stat_offset: company.jobStatReqOffset
        };

        const fields = data.companies[name].fields;
        for (const [name, entry] of Object.entries(extra.fields)) {
            if ((company.companyPositions as any)[entry]) {
                fields[name] = [];

                let job = data.jobs[entry];
                for (;;) {
                    fields[name].push(job);

                    if (job.nextPosition) {
                        job = data.jobs[job.nextPosition];
                        if (!(company.companyPositions as any)[job.name]) { break; }
                    } else { break; }
                }
            }
        }
    }
}
