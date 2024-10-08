import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function PUT(request: Request) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  
    const cookieStore = cookies();
    const token = cookieStore.get('token'); // Asegúrate de que el nombre coincide con la cookie configurada
  
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  
    const { data: { user }, error } = await supabase.auth.getUser(token.value);
  
    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  
    const updatedData = await request.json();
  
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
  
    if (updateError) {
      console.error('Error al actualizar el perfil:', updateError.message);
      return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 });
    }
  
    return NextResponse.json({ message: 'Perfil actualizado con éxito', updatedUser: data });
  }
  