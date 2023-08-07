export function getDiaSemana(dia: number){
    let eldia = dia;
    if(dia > 6) eldia = dia % 7;
    switch(eldia){
        case 0: return 'Domingo '
        case 1: return 'Lunes '
        case 2: return 'Martes '
        case 3: return 'Miercoles '
        case 4: return 'Jueves '
        case 5: return 'Viernes '
        case 6: return 'Sabado '
        default: return ''
    }
}

export function getMesDelAno(mes: number){
    let elmes = mes;
    if(mes > 11) elmes = mes % 12;
    switch(elmes){
        case 0: return 'enero';
        case 1: return 'febrero';
        case 2: return 'marzo';
        case 3: return 'abril';
        case 4: return 'mayo';
        case 5: return 'junio';
        case 6: return 'julio';
        case 7: return 'agosto';
        case 8: return 'setiembre';
        case 9: return 'octubre';
        case 10: return 'noviembre';
        case 11: return 'diciembre';
        default: return ''
    }
}