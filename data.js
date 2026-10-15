// GERADO por tools/atualizar-elencos.js em 2026-10-15 (elencos do Transfermarkt).
// Overall = estimativa pelo valor de mercado + bônus de veterano. Pode editar à mão, mas rodar o script de novo sobrescreve.
// Uma linha por jogador: POSIÇÃO OVERALL Nome   (posições: GOL LAT ZAG MEI ATA)
const CLUBES = [
  { id: 'FLA', nome: 'Flamengo', bg: '#C3281E', elenco: `
    GOL 81 Agustín Rossi
    GOL 76 Andrew
    LAT 76 Emerson Royal
    LAT 75 Ayrton Lucas
    LAT 73 Alex Sandro
    LAT 71 Guillermo Varela
    ZAG 81 Léo Ortiz
    ZAG 81 Léo Pereira
    ZAG 79 Vitão
    ZAG 75 Danilo
    MEI 84 Lucas Paquetá
    MEI 83 Giorgian de Arrascaeta
    MEI 81 Evertton Araújo
    MEI 81 Jorge Carrascal
    MEI 78 Erick Pulgar
    MEI 78 Jorginho
    ATA 83 Pedro
    ATA 82 Samuel Lino
    ATA 78 Gonzalo Plata
    ATA 78 Luiz Araújo
    ATA 71 Anthony Valencia` },
  { id: 'PAL', nome: 'Palmeiras', bg: '#006437', elenco: `
    GOL 78 Carlos Miguel
    GOL 62 Marcelo Lomba
    LAT 80 Joaquín Piquerez
    LAT 79 Agustín Giay
    LAT 77 Khellven
    LAT 75 Jefté
    ZAG 77 Alexander Barboza
    ZAG 77 Gustavo Gómez
    ZAG 76 Murilo
    ZAG 75 Bruno Fuchs
    MEI 82 Mauricio
    MEI 81 Andreas Pereira
    MEI 78 Marlon Freitas
    MEI 76 Emiliano Martínez
    MEI 76 Lucas Evangelista
    MEI 70 Luis Pacheco
    ATA 85 Vitor Roque
    ATA 84 José Manuel López
    ATA 81 Jhon Arias
    ATA 79 Ramón Sosa
    ATA 77 Paulinho` },
  { id: 'COR', nome: 'Corinthians', bg: '#141414', elenco: `
    GOL 80 Hugo Souza
    GOL 68 Kauê
    LAT 79 Matheuzinho
    LAT 78 Matheus Bidu
    LAT 70 Pedro Milans
    LAT 66 Hugo
    ZAG 75 João Pedro Tchoca
    ZAG 73 Iago Machado
    ZAG 70 André Ramalho
    ZAG 70 Gabriel Paulista
    MEI 83 Breno Bidon
    MEI 81 André
    MEI 80 Rodrigo Garro
    MEI 75 Raniele
    MEI 73 Jesse Lingard
    MEI 72 André Carrillo
    ATA 83 Yuri Alberto
    ATA 79 Memphis Depay
    ATA 77 Gui Negão
    ATA 76 Kaio César
    ATA 76 Dieguinho` },
  { id: 'SAO', nome: 'São Paulo', bg: '#D50000', elenco: `
    GOL 70 Carlos Coronel
    GOL 68 Rafael
    LAT 75 Pedro Lima
    LAT 74 Enzo Díaz
    LAT 73 Iago
    LAT 72 Wendell
    ZAG 73 Rafael Tolói
    ZAG 69 Domingos Duarte
    ZAG 68 Sabino
    ZAG 67 Matheus Belém
    MEI 81 Marcos Antônio
    MEI 78 Damián Bobadilla
    MEI 75 Pablo Maia
    MEI 73 Newton
    MEI 73 Cauly
    MEI 71 Djhordney
    ATA 78 Artur
    ATA 78 Jonathan Calleri
    ATA 76 Luciano
    ATA 75 Lucas Moura
    ATA 75 Ryan Francisco` },
  { id: 'SAN', nome: 'Santos', bg: '#f4f4f4', elenco: `
    GOL 80 Gabriel Brazão
    GOL 73 João Paulo
    LAT 77 Gabriel Menino
    LAT 75 Vinicius Lira
    LAT 71 Igor Vinícius
    LAT 71 Rodinei
    ZAG 76 João Ananias
    ZAG 76 Lucas Veríssimo
    ZAG 71 Alexis Duarte
    ZAG 71 Willian Arão
    MEI 82 Neymar
    MEI 80 Gabriel Bontempo
    MEI 76 Miguelito
    MEI 76 Philippe Coutinho
    MEI 75 Arthur Melo
    MEI 72 Lima
    ATA 79 Benjamín Rollheiser
    ATA 77 Álvaro Barreal
    ATA 77 Everton
    ATA 75 Gabriel Barbosa
    ATA 75 Rony` },
  { id: 'FLU', nome: 'Fluminense', bg: '#870A28', elenco: `
    GOL 64 Vitor Eudes
    GOL 62 Fábio
    LAT 77 Guilherme Arana
    LAT 71 Guga
    LAT 68 Renê
    LAT 66 Samuel Xavier
    ZAG 79 Thiago Silva
    ZAG 76 Juan Pablo Freytes
    ZAG 75 Julián Millán
    ZAG 74 Ignácio
    MEI 82 Martinelli
    MEI 81 Hércules
    MEI 78 Jefferson Savarino
    MEI 78 Luciano Acosta
    MEI 71 Nonato
    MEI 70 Otávio
    ATA 80 John Kennedy
    ATA 78 Agustín Canobbio
    ATA 77 Riquelme
    ATA 77 Rodrigo Castillo
    ATA 76 Kevin Serna` },
  { id: 'VAS', nome: 'Vasco', bg: '#111111', elenco: `
    GOL 79 Léo Jardim
    GOL 67 Daniel Fuzato
    LAT 80 Cuiabano
    LAT 77 Lucas Piton
    LAT 77 Paulo Henrique
    LAT 71 José Luis Rodríguez
    ZAG 80 Robert Renan
    ZAG 78 Carlos Cuesta
    ZAG 77 Gabriel Pereira
    ZAG 75 Lucas Freitas
    MEI 78 Santiago Sosa
    MEI 78 Alan Lescano
    MEI 77 Cauan Barros
    MEI 76 Ramon Rique
    MEI 74 Johan Rojas
    MEI 72 Thiago Mendes
    ATA 81 Andrés Gómez
    ATA 77 Nuno Moreira
    ATA 77 Facundo Colidio
    ATA 75 Marino Hinestroza
    ATA 75 Bruno Duarte` },
  { id: 'BOT', nome: 'Botafogo', bg: '#1a1a1a', elenco: `
    GOL 75 Gabriel Batista
    GOL 72 Warleson
    LAT 78 Vitinho
    LAT 76 Alex Telles
    LAT 73 Mateo Ponte
    LAT 66 Marçal
    ZAG 76 Arthur Chaves
    ZAG 76 Nahuel Ferraresi
    ZAG 72 Kaio
    ZAG 70 Lucas Monzón
    MEI 85 Danilo
    MEI 78 Cristian Medina
    MEI 73 Huguinho
    MEI 73 Allan
    MEI 72 Jordan Barrera
    MEI 70 Domingos Andrade
    ATA 81 Álvaro Montoro
    ATA 78 Arthur Cabral
    ATA 77 Matheus Martins
    ATA 76 Júnior Santos
    ATA 75 Hakim Ziyech` },
  { id: 'GRE', nome: 'Grêmio', bg: '#0D80BF', elenco: `
    GOL 72 Weverton
    GOL 70 Gabriel Grando
    LAT 74 Marlon
    LAT 71 Pedro Gabriel
    LAT 70 Caio Paulista
    LAT 70 Diego Caito
    ZAG 76 Gustavo Martins
    ZAG 73 Wallace
    ZAG 71 Wagner Leonardo
    ZAG 71 Fabián Balbuena
    MEI 77 Erick Noriega
    MEI 77 Juan Nardoni
    MEI 75 Mathías Villasanti
    MEI 72 Danilo Barbosa
    MEI 72 Filip Krovinovic
    MEI 71 Riquelme
    ATA 78 Francis Amuzu
    ATA 78 Carlos Vinícius
    ATA 77 Tetê
    ATA 73 Cristian Pavón
    ATA 72 José Enamorado` },
  { id: 'INT', nome: 'Internacional', bg: '#E30613', elenco: `
    GOL 74 Sergio Rochet
    GOL 73 Anthoni
    LAT 78 Alexandro Bernabei
    LAT 77 Bruno Gomes
    LAT 72 Matheus Bahia
    LAT 72 Braian Aguirre
    ZAG 75 Victor Gabriel
    ZAG 74 Guillermo Maripán
    ZAG 68 Juninho
    ZAG 67 Félix Torres
    MEI 76 Alan Patrick
    MEI 74 Rodrigo Villagra
    MEI 74 Niclas Eliasson
    MEI 71 Ronaldo
    MEI 71 Thiago Maia
    MEI 70 Calebe
    ATA 77 Johan Carbonero
    ATA 75 Vitinho
    ATA 75 Kayky
    ATA 72 Alerrandro
    ATA 72 Antonio Sanabria` },
  { id: 'CAM', nome: 'Atlético-MG', bg: '#111111', elenco: `
    GOL 73 Gabriel Delfim
    GOL 73 Everson
    LAT 79 Renan Lodi
    LAT 75 Natanael
    LAT 74 Angelo Preciado
    LAT 72 Kauã Pascini
    ZAG 75 Lyanco
    ZAG 75 Ruan
    ZAG 72 Léo Duarte
    ZAG 70 Vitão
    MEI 78 Victor Hugo
    MEI 78 Fred
    MEI 78 Gustavo Scarpa
    MEI 76 Alexsander
    MEI 76 Kevin Castaño
    MEI 75 Alan Franco
    ATA 78 Tomás Cuello
    ATA 78 Mateo Cassierra
    ATA 77 Alan Minda
    ATA 74 Thiago Borbas
    ATA 71 Dudu` },
  { id: 'CRU', nome: 'Cruzeiro', bg: '#0033A0', elenco: `
    GOL 79 Otávio
    GOL 67 Léo Aragão
    LAT 75 Gabriel Rojas
    LAT 74 William
    LAT 73 Kauã Moraes
    LAT 72 Matías Viña
    ZAG 80 Jonathan Jesus
    ZAG 80 Fabrício Bruno
    ZAG 73 João Marcelo
    ZAG 73 Lucas Villalba
    MEI 82 Gerson
    MEI 81 Matheus Pereira
    MEI 78 Zé Lucas
    MEI 77 Matheus Henrique
    MEI 75 Lucas Romero
    MEI 71 Felipe Morais
    ATA 83 Kaio Jorge
    ATA 80 Keny Arroyo
    ATA 79 Luis Sinisterra
    ATA 78 Luciano Rodríguez
    ATA 77 Gabriel Pec` },
].map(c => ({
  ...c,
  escudo: `escudos/${c.id}.png`,
  jogadores: c.elenco.trim().split('\n').map(l => {
    const [pos, ovr, ...nome] = l.trim().split(/\s+/);
    return { id: `${c.id}:${nome.join(' ')}`, nome: nome.join(' '), pos, ovr: +ovr, clube: c.id };
  }),
}));
