<template>
  <div id="app">
   <header>
        <div class="inner-header">
            <nav>
                <ul>
                    <li>gchan</li>
                    <li><a href='#mensagens'>mensagens</a></li>
                    <li><a href='#info'>info/postagem</a></li>
                </ul>
            </nav>
            <form>
                <label for='search'>Busque:</label>
                <input type='text' name='search' placeholder='assunto/mensagem' required>
                <button type='sumit'>pesquisar</button>
            </form>
        </div>
    </header>

    <router-view class='container'/>
  </div>
</template>
