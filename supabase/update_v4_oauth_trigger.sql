-- ====================================================================
-- Actualización del trigger handle_new_user para soportar Google OAuth
-- Ejecutar en Supabase SQL Editor
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  -- 1. Determinar el nombre de usuario base desde los metadatos o el email
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'user'
  );

  -- 2. Limpiar caracteres no deseados (espacios, caracteres especiales, y pasar a minúsculas)
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  IF coalesce(base_username, '') = '' THEN
    base_username := 'user';
  END IF;

  -- 3. Añadir un sufijo aleatorio corto para evitar colisiones del UNIQUE constraint
  final_username := base_username || '_' || substr(md5(random()::text), 1, 4);

  -- 4. Insertar el nuevo perfil con fallbacks seguros para nombre y foto
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email, short_id)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.email,
    public.generate_short_id()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Captura cualquier error de Postgres para no bloquear el registro en Supabase Auth
    RAISE LOG 'Error en handle_new_user para uid %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
