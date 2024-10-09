import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function PUT(request: Request) {
    // Crear el cliente de Supabase
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Obtener la cookie de autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token'); // Asegúrate de que el nombre coincida con la cookie configurada
    console.log('Token recibido:', token?.value);

    // Verificar si existe el token
    if (!token) {
        console.error('Token no encontrado');
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Intentar obtener el usuario a partir del token
    const { data: { user }, error } = await supabase.auth.getUser(token.value);
    console.log('Usuario obtenido:', user);
    console.error('Error de autenticación:', error);

    // Si hay un error o no se encontró el usuario, retornar 401
    if (error || !user) {
        console.error('Error de autenticación o usuario no encontrado');
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Parsear los datos enviados en la solicitud
    const updatedData = await request.json();
    console.log('Datos para actualizar:', updatedData);

    // Intentar actualizar el perfil del usuario
    const { data, error: updateError } = await supabase
        .from('users')
        .update({
            first_name: updatedData.firstName,
            last_name: updatedData.lastName,
            phone_number: updatedData.phoneNumber,
            address: updatedData.address,
            age: updatedData.age,
        })
        .eq('email', user.email);

    // Log para verificar la respuesta del intento de actualización
    console.log('Resultado de la actualización:', data);
    console.error('Error al actualizar el perfil:', updateError?.message);

    // Si hay un error en la actualización, retornar 500
    if (updateError) {
        return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 });
    }

    // Respuesta exitosa
    return NextResponse.json({ message: 'Perfil actualizado con éxito', updatedUser: data });
}
