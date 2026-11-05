// GERADO por tools/atualizar-elencos.js g12 em 2026-11-05 (elencos do Transfermarkt): os 12 grandes do Brasil.
// Overall = estimativa pelo valor de mercado + bônus de veterano. Pode editar à mão, mas rodar o script de novo sobrescreve.
// Uma linha por jogador: POSIÇÃO OVERALL Nome   (posições: GOL LAT ZAG MEI ATA)
const CLUBES = [
  { id: 'FLA', nome: 'Flamengo', bg: '#C3281E', elenco: `
    GOL 81 Agustín Rossi
    GOL 76 Andrew
    GOL 64 Dyogo Alves
    LAT 76 Emerson Royal
    LAT 75 Ayrton Lucas
    LAT 73 Alex Sandro
    LAT 71 Guillermo Varela
    ZAG 81 Léo Ortiz
    ZAG 81 Léo Pereira
    ZAG 79 Vitão
    ZAG 75 Danilo
    ZAG 67 João Souza
    MEI 84 Lucas Paquetá
    MEI 83 Giorgian de Arrascaeta
    MEI 81 Evertton Araújo
    MEI 81 Jorge Carrascal
    MEI 78 Erick Pulgar
    MEI 78 Jorginho
    MEI 77 Nicolás de la Cruz
    MEI 70 Saúl Ñíguez
    ATA 83 Pedro
    ATA 82 Samuel Lino
    ATA 78 Gonzalo Plata
    ATA 78 Luiz Araújo
    ATA 71 Anthony Valencia
    ATA 71 Joaquín Freitas
    ATA 71 Bruno Henrique` },
  { id: 'PAL', nome: 'Palmeiras', bg: '#006437', elenco: `
    GOL 78 Carlos Miguel
    GOL 62 Marcelo Lomba
    GOL 55 Bruno Bertinato
    LAT 80 Joaquín Piquerez
    LAT 79 Agustín Giay
    LAT 77 Khellven
    LAT 75 Jefté
    LAT 75 Arthur Gabriel
    ZAG 77 Alexander Barboza
    ZAG 77 Gustavo Gómez
    ZAG 76 Murilo
    ZAG 75 Bruno Fuchs
    ZAG 75 Luis Benedetti
    MEI 82 Mauricio
    MEI 81 Andreas Pereira
    MEI 78 Marlon Freitas
    MEI 76 Emiliano Martínez
    MEI 76 Lucas Evangelista
    MEI 70 Luis Pacheco
    MEI 68 Larson
    MEI 68 Erick Belé
    ATA 85 Vitor Roque
    ATA 84 José Manuel López
    ATA 81 Jhon Arias
    ATA 79 Ramón Sosa
    ATA 77 Paulinho
    ATA 71 Felipe Anderson` },
  { id: 'COR', nome: 'Corinthians', bg: '#141414', elenco: `
    GOL 80 Hugo Souza
    GOL 68 Kauê
    GOL 65 Felipe Longo
    LAT 79 Matheuzinho
    LAT 78 Matheus Bidu
    LAT 70 Pedro Milans
    LAT 66 Hugo
    LAT 66 Fabrizio Angileri
    LAT 65 Léo Mana
    ZAG 75 João Pedro Tchoca
    ZAG 73 Iago Machado
    ZAG 70 André Ramalho
    ZAG 70 Gabriel Paulista
    ZAG 69 Gustavo Henrique
    ZAG 55 Renato Santos
    MEI 83 Breno Bidon
    MEI 81 André
    MEI 80 Rodrigo Garro
    MEI 75 Raniele
    MEI 73 Jesse Lingard
    MEI 72 André Carrillo
    MEI 71 Allan
    MEI 70 Matheus Pereira
    MEI 70 Alex Santana
    MEI 67 Charles
    MEI 67 Zakaria Labyad
    MEI 55 Bahia
    ATA 83 Yuri Alberto
    ATA 79 Memphis Depay
    ATA 77 Gui Negão
    ATA 76 Kaio César
    ATA 76 Dieguinho
    ATA 71 Pedro Raul
    ATA 70 Kayke
    ATA 70 Vitinho` },
  { id: 'SAO', nome: 'São Paulo', bg: '#D50000', elenco: `
    GOL 70 Carlos Coronel
    GOL 68 Rafael
    GOL 57 Young
    GOL 55 João Pedro
    GOL 55 Felipe Preis
    LAT 75 Pedro Lima
    LAT 74 Enzo Díaz
    LAT 73 Iago
    LAT 72 Wendell
    LAT 70 Aurélio Buta
    LAT 70 Cédric Soares
    LAT 69 Lucas Ramon
    LAT 55 Nicolas
    LAT 55 Igor Felisberto
    ZAG 73 Rafael Tolói
    ZAG 69 Sabino
    ZAG 69 Domingos Duarte
    ZAG 67 Matheus Belém
    ZAG 67 Robert Arboleda
    ZAG 65 Luis Osorio
    ZAG 55 Isac
    MEI 81 Marcos Antônio
    MEI 78 Damián Bobadilla
    MEI 75 Pablo Maia
    MEI 73 Newton
    MEI 73 Cauly
    MEI 71 Djhordney
    MEI 70 Danielzinho
    MEI 55 Pedro Ferreira
    ATA 78 Artur
    ATA 78 Jonathan Calleri
    ATA 76 Luciano
    ATA 75 Lucas Moura
    ATA 75 Ryan Francisco
    ATA 74 Victor Sá
    ATA 73 Ferreirinha
    ATA 73 Lucca
    ATA 72 André Silva
    ATA 68 Tetê
    ATA 68 Gustavo Santana` },
  { id: 'SAN', nome: 'Santos', bg: '#f4f4f4', elenco: `
    GOL 80 Gabriel Brazão
    GOL 73 João Paulo
    GOL 60 Diógenes
    GOL 55 João Fernandes
    GOL 55 Rodrigo Falcão
    LAT 77 Gabriel Menino
    LAT 75 Vinicius Lira
    LAT 71 Igor Vinícius
    LAT 71 Rodinei
    LAT 67 Gonzalo Escobar
    ZAG 76 João Ananias
    ZAG 76 Lucas Veríssimo
    ZAG 71 Alexis Duarte
    ZAG 71 Willian Arão
    ZAG 69 Luan Peres
    ZAG 55 João Alencar
    MEI 82 Neymar
    MEI 80 Gabriel Bontempo
    MEI 76 Miguelito
    MEI 76 Philippe Coutinho
    MEI 75 Arthur Melo
    MEI 72 Lima
    MEI 71 Gustavinho
    MEI 70 Christian Oliva
    MEI 70 João Schmidt
    MEI 70 Thaciano
    MEI 68 Nadson
    MEI 55 Pepê Fermino
    ATA 79 Benjamín Rollheiser
    ATA 77 Álvaro Barreal
    ATA 77 Everton
    ATA 75 Gabriel Barbosa
    ATA 75 Rony
    ATA 72 Moisés
    ATA 68 Gustavo Caballero
    ATA 64 Mateus Xavier
    ATA 55 Andrey Quintino
    ATA 55 Enzo Boer` },
  { id: 'FLU', nome: 'Fluminense', bg: '#870A28', elenco: `
    GOL 64 Vitor Eudes
    GOL 62 Fábio
    GOL 60 Marcelo Pitaluga
    LAT 77 Guilherme Arana
    LAT 71 Guga
    LAT 68 Renê
    LAT 66 Samuel Xavier
    LAT 65 Julio Fidelis
    LAT 63 Jhonny
    LAT 55 Léo Jance
    ZAG 79 Thiago Silva
    ZAG 76 Juan Pablo Freytes
    ZAG 75 Julián Millán
    ZAG 74 Ignácio
    ZAG 73 Jemmes
    ZAG 71 Igor Rabello
    MEI 82 Martinelli
    MEI 81 Hércules
    MEI 78 Luciano Acosta
    MEI 71 Nonato
    MEI 70 Otávio
    MEI 70 Alisson
    MEI 68 Ganso
    MEI 55 Luis Fernando
    MEI 55 Yago Ferreira
    ATA 80 John Kennedy
    ATA 78 Jefferson Savarino
    ATA 78 Agustín Canobbio
    ATA 77 Riquelme
    ATA 77 Rodrigo Castillo
    ATA 76 Kevin Serna
    ATA 74 Hulk
    ATA 73 Yeferson Soteldo
    ATA 71 Germán Cano
    ATA 68 Wesley Natã
    ATA 55 Matheus Reis` },
  { id: 'VAS', nome: 'Vasco', bg: '#111111', elenco: `
    GOL 79 Léo Jardim
    GOL 67 Daniel Fuzato
    GOL 55 Pablo
    LAT 80 Cuiabano
    LAT 77 Lucas Piton
    LAT 77 Paulo Henrique
    LAT 71 José Luis Rodríguez
    LAT 66 Riquelme
    LAT 66 Paulinho
    LAT 65 João Mutano
    ZAG 80 Robert Renan
    ZAG 78 Carlos Cuesta
    ZAG 77 Gabriel Pereira
    ZAG 75 Lucas Freitas
    ZAG 69 Alan Saldivia
    ZAG 55 Walace Falcão
    MEI 78 Santiago Sosa
    MEI 78 Alan Lescano
    MEI 77 Cauan Barros
    MEI 76 Ramon Rique
    MEI 74 Johan Rojas
    MEI 72 Thiago Mendes
    MEI 71 Tchê Tchê
    MEI 69 Mateus Carvalho
    MEI 68 Jair
    MEI 68 Guilherme Estrella
    MEI 55 Euder
    ATA 81 Andrés Gómez
    ATA 77 Nuno Moreira
    ATA 77 Facundo Colidio
    ATA 75 Marino Hinestroza
    ATA 75 Bruno Duarte
    ATA 75 Brenner
    ATA 73 Claudio Spinelli
    ATA 72 David
    ATA 72 Adson
    ATA 69 Loide Augusto` },
  { id: 'BOT', nome: 'Botafogo', bg: '#1a1a1a', elenco: `
    GOL 75 Gabriel Batista
    GOL 72 Warleson
    GOL 63 Cristhian Loor
    LAT 78 Vitinho
    LAT 76 Alex Telles
    LAT 73 Mateo Ponte
    LAT 66 Marçal
    LAT 65 Paulinho
    LAT 63 Kadu Santos
    LAT 59 Jhoan Hernández
    ZAG 76 Arthur Chaves
    ZAG 76 Nahuel Ferraresi
    ZAG 72 Kaio
    ZAG 70 Lucas Monzón
    ZAG 70 Gabriel Justino
    ZAG 62 Anthony
    ZAG 55 Kawan
    MEI 85 Danilo
    MEI 78 Cristian Medina
    MEI 73 Huguinho
    MEI 73 Allan
    MEI 72 Jordan Barrera
    MEI 70 Domingos Andrade
    MEI 68 Wallace Davi
    MEI 67 Edenilson
    ATA 81 Álvaro Montoro
    ATA 78 Arthur Cabral
    ATA 77 Matheus Martins
    ATA 76 Júnior Santos
    ATA 75 Hakim Ziyech
    ATA 72 Tiquinho Soares
    ATA 71 Kadir Barría
    ATA 71 Lucas Emanuel
    ATA 70 Lucas Villalba
    ATA 70 Danilo (ATA)
    ATA 68 Kauan Toledo` },
  { id: 'GRE', nome: 'Grêmio', bg: '#0D80BF', elenco: `
    GOL 72 Weverton
    GOL 70 Gabriel Grando
    GOL 55 Thiago Beltrame
    GOL 55 Gabriel Menegon
    LAT 74 Marlon
    LAT 71 Pedro Gabriel
    LAT 70 Caio Paulista
    LAT 70 Diego Caito
    LAT 68 João Pedro
    LAT 65 Marcos Rocha
    ZAG 76 Gustavo Martins
    ZAG 73 Wallace
    ZAG 71 Wagner Leonardo
    ZAG 71 Fabián Balbuena
    ZAG 68 Walter Kannemann
    ZAG 65 Luis Eduardo
    ZAG 55 Athos Thawan
    MEI 77 Erick Noriega
    MEI 77 Juan Nardoni
    MEI 75 Mathías Villasanti
    MEI 72 Danilo Barbosa
    MEI 72 Filip Krovinovic
    MEI 71 Riquelme
    MEI 66 Dodi
    MEI 65 Tiago Augusto
    ATA 78 Francis Amuzu
    ATA 78 Carlos Vinícius
    ATA 77 Tetê
    ATA 73 Cristian Pavón
    ATA 72 José Enamorado
    ATA 71 Matheus Nascimento
    ATA 71 Martin Braithwaite
    ATA 70 Jovane Cabral
    ATA 64 Roger` },
  { id: 'INT', nome: 'Internacional', bg: '#E30613', elenco: `
    GOL 74 Sergio Rochet
    GOL 73 Anthoni
    GOL 72 Matheus Cunha
    GOL 55 Kauan
    GOL 55 Diego Esser
    LAT 78 Alexandro Bernabei
    LAT 77 Bruno Gomes
    LAT 72 Matheus Bahia
    LAT 72 Braian Aguirre
    ZAG 75 Victor Gabriel
    ZAG 74 Guillermo Maripán
    ZAG 68 Juninho
    ZAG 67 Félix Torres
    ZAG 63 Gabriel Mercado
    MEI 76 Alan Patrick
    MEI 74 Rodrigo Villagra
    MEI 74 Niclas Eliasson
    MEI 72 Ronaldo
    MEI 71 Thiago Maia
    MEI 70 Calebe
    MEI 68 Paulinho Paula
    MEI 68 Bruno Henrique
    MEI 68 Allex
    MEI 65 Yago Noal
    MEI 55 Benjamin
    ATA 77 Johan Carbonero
    ATA 75 Vitinho
    ATA 75 Kayky
    ATA 72 Alerrandro
    ATA 72 Antonio Sanabria
    ATA 68 Raykkonen` },
  { id: 'CAM', nome: 'Atlético-MG', bg: '#111111', elenco: `
    GOL 73 Gabriel Delfim
    GOL 73 Everson
    GOL 66 Pedro Cobra
    GOL 55 Robert
    LAT 79 Renan Lodi
    LAT 75 Natanael
    LAT 74 Angelo Preciado
    LAT 72 Kauã Pascini
    ZAG 75 Lyanco
    ZAG 75 Ruan
    ZAG 72 Léo Duarte
    ZAG 70 Vitão
    ZAG 70 Vitor Hugo
    MEI 78 Victor Hugo
    MEI 78 Fred
    MEI 78 Gustavo Scarpa
    MEI 76 Alexsander
    MEI 76 Kevin Castaño
    MEI 75 Alan Franco
    MEI 75 Reinier
    MEI 73 Tomás Pérez
    MEI 72 Mamady Cissé
    MEI 72 Igor Gomes
    MEI 71 Maycon
    MEI 55 Índio
    ATA 78 Tomás Cuello
    ATA 78 Mateo Cassierra
    ATA 77 Alan Minda
    ATA 74 Thiago Borbas
    ATA 71 Dudu
    ATA 70 Bernard
    ATA 70 Cauã Soares` },
  { id: 'CRU', nome: 'Cruzeiro', bg: '#0033A0', elenco: `
    GOL 79 Otávio
    GOL 67 Léo Aragão
    GOL 67 Cássio
    LAT 75 Gabriel Rojas
    LAT 74 William
    LAT 73 Lucas Villalba
    LAT 73 Kauã Moraes
    LAT 72 Matías Viña
    LAT 66 Fagner
    ZAG 80 Jonathan Jesus
    ZAG 80 Fabrício Bruno
    ZAG 73 João Marcelo
    MEI 82 Gerson
    MEI 81 Matheus Pereira
    MEI 78 Zé Lucas
    MEI 77 Matheus Henrique
    MEI 75 Lucas Romero
    MEI 71 Felipe Morais
    MEI 67 Lucas Silva
    MEI 67 Fabrizio Peralta
    ATA 83 Kaio Jorge
    ATA 80 Keny Arroyo
    ATA 79 Luis Sinisterra
    ATA 78 Luciano Rodríguez
    ATA 77 Gabriel Pec
    ATA 76 Wanderson
    ATA 75 Wesley
    ATA 75 Néiser Villarreal
    ATA 73 Kaique Kenji
    ATA 72 Marquinhos
    ATA 72 João Costa
    ATA 69 Bruno Rodrigues` },
].map(c => ({
  ...c,
  escudo: `escudos/${c.id}.png`,
  jogadores: c.elenco.trim().split('\n').map(l => {
    const [pos, ovr, ...nome] = l.trim().split(/\s+/);
    return { id: `${c.id}:${nome.join(' ')}`, nome: nome.join(' '), pos, ovr: +ovr, clube: c.id };
  }),
}));
