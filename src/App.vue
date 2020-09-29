<template>
  <div id="app">
   <header>
        <div class="inner-header">
            <nav>
                <ul>
                    <li><p>gchan</p><img src="@/assets/sham.png"></li>
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
        <div class="resp-header">
            <ul>
                <li>gchan<img src="assets/sham.png"></li>
                <li>
                    <form>
                        <label for='search'>Busque:</label>
                        <input type='text' name='search' placeholder='assunto/mensagem' required>
                        <button type='sumit'>pesquisar</button>
                    </form>
                </li>
            </ul>
        </div>
    </header>

    <router-view class='container'/>
  </div>
</template>
