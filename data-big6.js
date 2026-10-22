// GERADO por tools/atualizar-elencos.js big6 em 2026-10-22 (elencos do Transfermarkt): o Big Six da Inglaterra.
// Overall = estimativa pelo valor de mercado + bônus de veterano. Pode editar à mão, mas rodar o script de novo sobrescreve.
// Uma linha por jogador: POSIÇÃO OVERALL Nome   (posições: GOL LAT ZAG MEI ATA)
const CLUBES_BIG6 = [
  { id: 'ARS', nome: 'Arsenal', bg: '#EF0107', elenco: `
    GOL 84 David Raya
    GOL 74 Kepa Arrizabalaga
    LAT 87 Riccardo Calafiori
    LAT 87 Jurriën Timber
    LAT 83 Ben White
    ZAG 90 William Saliba
    ZAG 88 Gabriel
    ZAG 85 Piero Hincapié
    ZAG 85 Ezri Konsa
    MEI 91 Declan Rice
    MEI 88 Bruno Guimarães
    MEI 88 Martin Ødegaard
    MEI 87 Martín Zubimendi
    MEI 86 Eberechi Eze
    MEI 85 Myles Lewis-Skelly
    ATA 90 Bukayo Saka
    ATA 86 Kai Havertz
    ATA 86 Viktor Gyökeres
    ATA 85 Noni Madueke
    ATA 84 Christos Tzolis` },
  { id: 'MCI', nome: 'Manchester City', bg: '#6CABDD', elenco: `
    GOL 87 Gianluigi Donnarumma
    GOL 75 Gerónimo Rulli
    LAT 88 Josko Gvardiol
    LAT 87 Nico O'Reilly
    LAT 85 Matheus Nunes
    LAT 83 Rayan Aït-Nouri
    ZAG 88 Marc Guéhi
    ZAG 85 Rúben Dias
    ZAG 85 Abdukodir Khusanov
    ZAG 81 Vitor Reis
    MEI 91 Elliot Anderson
    MEI 91 Enzo Fernández
    MEI 90 Rayan Cherki
    MEI 87 Phil Foden
    MEI 86 Ayyoub Bouaddi
    MEI 78 Mateo Kovacic
    ATA 93 Erling Haaland
    ATA 88 Jérémy Doku
    ATA 88 Antoine Semenyo
    ATA 87 Iliman Ndiaye
    ATA 82 Allan` },
  { id: 'MUN', nome: 'Manchester United', bg: '#DA291C', elenco: `
    GOL 83 Senne Lammens
    GOL 60 Karl Darlow
    LAT 82 Diogo Dalot
    LAT 79 Noussair Mazraoui
    LAT 76 Luke Shaw
    LAT 68 Harry Amass
    ZAG 85 Lisandro Martínez
    ZAG 83 Leny Yoro
    ZAG 81 Ayden Heaven
    ZAG 81 Matthijs de Ligt
    MEI 88 Kobbie Mainoo
    MEI 87 Carlos Baleba
    MEI 87 Bruno Fernandes
    MEI 85 Andrey Santos
    MEI 84 Youri Tielemans
    MEI 81 Mason Mount
    ATA 88 Bryan Mbeumo
    ATA 88 Matheus Cunha
    ATA 88 Benjamin Šeško
    ATA 85 Amad Diallo
    ATA 83 Marcus Rashford` },
  { id: 'CHE', nome: 'Chelsea', bg: '#034694', elenco: `
    GOL 84 Emiliano Martínez
    GOL 81 Mike Penders
    LAT 86 Reece James
    LAT 85 Marco Palestra
    LAT 83 Jorrel Hato
    LAT 83 Malo Gusto
    ZAG 86 Maxence Lacroix
    ZAG 85 Levi Colwill
    ZAG 83 Wesley Fofana
    ZAG 81 Josh Acheampong
    MEI 91 Morgan Rogers
    MEI 90 Moisés Caicedo
    MEI 90 Cole Palmer
    MEI 84 Valentín Barco
    MEI 81 Roméo Lavia
    MEI 68 Jordan Henderson
    ATA 90 João Pedro
    ATA 86 Pedro Neto
    ATA 85 Estêvão
    ATA 81 Jamie Gittens
    ATA 81 Geovany Quenda` },
  { id: 'TOT', nome: 'Tottenham', bg: '#132257', elenco: `
    GOL 79 Antonín Kinský
    GOL 63 Martin Dúbravka
    LAT 85 Pedro Porro
    LAT 82 Archie Gray
    LAT 81 Destiny Udogie
    LAT 80 Andrew Robertson
    ZAG 86 Jan Paul van Hecke
    ZAG 85 Micky van de Ven
    ZAG 80 Marcos Senesi
    ZAG 77 Tosin Adarabioyo
    MEI 89 Sandro Tonali
    MEI 87 Mateus Fernandes
    MEI 84 Xavi Simons
    MEI 83 Lucas Bergvall
    MEI 83 Conor Gallagher
    MEI 79 Rodrigo Bentancur
    ATA 85 Sávio
    ATA 85 Mohammed Kudus
    ATA 85 Omar Marmoush
    ATA 81 Dominic Solanke
    ATA 80 Mathys Tel` },
  { id: 'LIV', nome: 'Liverpool', bg: '#C8102E', elenco: `
    GOL 86 Alisson
    GOL 82 Giorgi Mamardashvili
    LAT 83 Milos Kerkez
    LAT 82 Jeremie Frimpong
    LAT 80 Conor Bradley
    LAT 72 Konstantinos Tsimikas
    ZAG 87 Jérémy Jacquet
    ZAG 87 Virgil van Dijk
    ZAG 81 Ronald Araújo
    ZAG 78 Giovanni Leoni
    MEI 90 Dominik Szoboszlai
    MEI 89 Florian Wirtz
    MEI 88 Ryan Gravenberch
    MEI 87 Alexis Mac Allister
    MEI 76 Trey Nyoni
    MEI 72 Wataru Endo
    ATA 90 Bradley Barcola
    ATA 89 Alexander Isak
    ATA 88 Cody Gakpo
    ATA 88 Hugo Ekitiké
    ATA 84 Víctor Muñoz` },
].map(c => ({
  ...c,
  escudo: `escudos/${c.id}.png`,
  jogadores: c.elenco.trim().split('\n').map(l => {
    const [pos, ovr, ...nome] = l.trim().split(/\s+/);
    return { id: `${c.id}:${nome.join(' ')}`, nome: nome.join(' '), pos, ovr: +ovr, clube: c.id };
  }),
}));
