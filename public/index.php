<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../vendor/autoload.php';

// Constants
define('base_path', dirname(__DIR__));
define('content_path', base_path . DIRECTORY_SEPARATOR . 'content');
define('layouts_path', base_path . DIRECTORY_SEPARATOR . 'layouts');
define('components_path', base_path . DIRECTORY_SEPARATOR . 'layouts'.DIRECTORY_SEPARATOR.'components');
define('config_path', base_path . DIRECTORY_SEPARATOR . 'config');


$configFile = file_get_contents(config_path.'/config.json');

$config = json_decode($configFile,true);

$c = new \Slim\Container(); //Create Your container

// We start Slim and create a new PagesCollection
$app = new \Slim\App($c);

$pages = new \App\PagesCollection();


$container = $app->getContainer();

// Register component on container
$container['view'] = function ($container) use ($config) {
    $view = new \Slim\Views\Twig('../layouts',[
        'debug' => $config['debug'],
    ]);

    // Instantiate and add Slim specific extension
    $router = $container->get('router');
    $uri = \Slim\Http\Uri::createFromEnvironment(new \Slim\Http\Environment($_SERVER));
    $view->addExtension(new \Slim\Views\TwigExtension($router, $uri));
    $view->addExtension(new Twig_Extension_Debug());

    return $view;
};

$container['notFoundHandler'] = function ($c) {
    return function ($request, $response) use ($c) {
        return $c['view']->render($response->withStatus(404), 'error/404.html.twig');
    };
};

$app->post('/sendmail', function(Request $request, Response $response) use ($config) {
    $postData = $request->getParsedBody();
    // Create the Transport
    $transport = (new Swift_SmtpTransport($config['email']['host'],  $config['email']['port']))
        ->setUsername( $config['email']['username'])
        ->setPassword( $config['email']['password']);
    // Create the Mailer using your created Transport
    $mailer = new Swift_Mailer($transport);

// Create a message
    $message = (new Swift_Message($postData['subject']))
        ->setFrom($config['email']['username'])
        ->setTo($config['email']['recipient'])
        ->setBody($this->view->render($response,'mail.html.twig', ['data' => $postData])->getBody(),'text/html');

    $result = $mailer->send($message);
    //TODO: Logger les erreurs
    return $response->withRedirect('/');

});
$siteConfig = $config['siteConfig'];
foreach($pages as $page){

    $app->any($page->getUrl(), function($request, $response, $args) use ($page,$siteConfig){
        return $this->view->render($response, $page->getLayout().'.html.twig', [
            'page' => $page,
            'config' =>$siteConfig
        ]);
    })->setName($page->getName());
}
$app->run();
